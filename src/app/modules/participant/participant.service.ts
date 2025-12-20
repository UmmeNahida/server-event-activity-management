import httpStatus from "http-status-codes";
import { prisma } from "../../../lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { stripe } from "../../helper/stripe";
import { JwtPayload } from "jsonwebtoken";
import { IReview } from "../../types/userType";
import { envVars } from "@/app/config/env";
import {
  calcultatepagination,
  Ioptions,
} from "@/app/helper/paginationHelper";
import AppError from "@/app/config/customizer/AppError";
import { JoinedEventFilters } from "@/app/types/participants";
import { endOfDay, isValid, parseISO, startOfDay } from "date-fns";

const jointEvents = async (userId: string, eventId: string) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, role: "USER" },
  });

  if (!user) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only users can join events"
    );
  }

  // check already joined
  const alreadyJoined = await prisma.eventParticipant.findFirst({
    where: { userId, eventId },
  });

  if (alreadyJoined) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You already joined this event"
    );
  }

  // check existing payment
  const existingPayment = await prisma.payment.findFirst({
    where: { userId, eventId, status: "PAID" },
  });

  if (existingPayment) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment already exists for this event"
    );
  }

  const eventData = await prisma.event.findFirst({
    where: { id: eventId },
  });

  if (!eventData) {
    throw new AppError(httpStatus.NOT_FOUND, "Event not found");
  }

  // disallow joining past events
  const nowDate = new Date();
  if (new Date(eventData.date) < nowDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot join past events"
    );
  }

  //  check max participants
  if (eventData.participantCount > eventData.maxParticipants) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Event has reached maximum participants"
    );
  }

  // increment participant count
  const participantCount = eventData.participantCount + 1;

  const result = await prisma.$transaction(async (tnx) => {
    await tnx.event.update({
      where: { id: eventData.id },
      data: { participantCount },
    });

    const eventParticipant = await tnx.eventParticipant.create({
      data: {
        userId,
        eventId: eventData.id,
      },
    });

    const transactionId = uuidv4();

    const paymentData = await tnx.payment.create({
      data: {
        userId: user.id,
        eventId: eventData.id,
        amount: eventData.fee,
        status: "PENDING",
        transactionId,
      },
    });

    // return eventData
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `Event with ${eventData.name}`,
            },
            unit_amount: eventData.fee * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        participantId: eventParticipant.id,
        paymentId: paymentData.id,
      },
      success_url: `${envVars.FRONTEND_BASE_URL}/user/dashboard/joined-events`,
      cancel_url: `${envVars.FRONTEND_BASE_URL}/cancelled-payment`,
    });
    console.log("session:", session);

    return {
      eventParticipant,
      paymentData,
      paymentUrl: session.url,
    };
  });

  return result;
};

const addReview = async (user: JwtPayload, payload: IReview) => {
  const { eventId, rating, comment } = payload;
  console.log("addreview", payload);

  // 1. Check user participated
  const participated = await prisma.eventParticipant.findFirst({
    where: {
      eventId,
      userId: user.id,
    },
  });

  if (!participated) {
    throw new AppError(
      400,
      "You cannot review an event you didn't join!"
    );
  }

  // 2. Check event completed
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) throw new AppError(404, "Event not found!");

  if (new Date(event.date) > new Date()) {
    throw new AppError(400, "You can review only completed events!");
  }

  // rating
  if (rating > 5) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "please give 5 ratings"
    );
  }

  // 3. Create review
  const review = await prisma.review.create({
    data: {
      rating,
      comment,
      eventId,
      reviewerId: user.id,
      hostId: event.hostId,
    },
  });

  return review;
};

const getJoinedEvents = async (
  userId: string,
  filters: any,
  options: any
) => {
  const { search, date, location, type, fee } = filters;
  const { page, limit, skip } = calcultatepagination(options);

  console.log(location);

  const eventAndConditions: any[] = [];

  if (search) {
    eventAndConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (location) {
    eventAndConditions.push({
      location: {
        contains: location,
        mode: "insensitive",
      },
    });
  }

  if (type) {
    eventAndConditions.push({
      type: {
        equals: type,
        mode: "insensitive",
      },
    });
  }

  if (date) {
    const parsedDate = parseISO(date);
    if (isValid(parsedDate)) {
      eventAndConditions.push({
        date: {
          gte: startOfDay(parsedDate),
          lte: endOfDay(parsedDate),
        },
      });
    }
  }

  if (fee) {
    const [minFee, maxFee] = fee.split(",").map(Number);
    if (!isNaN(minFee) && !isNaN(maxFee)) {
      eventAndConditions.push({
        fee: {
          gte: minFee,
          lte: maxFee,
        },
      });
    }
  }

  const whereCondition: any = {
    userId,
    ...(eventAndConditions.length > 0 && {
      event: {
        AND: eventAndConditions,
      },
    }),
  };

  const joinedEvents = await prisma.eventParticipant.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy: { joinedAt: "desc" },
    include: {
      event: {
        include: {
          host: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  const total = await prisma.eventParticipant.count({
    where: whereCondition,
  });

  return {
    success: true,
    message: "All Joined events retrieve successfully",
    data: {
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
      data: joinedEvents,
    },
  };
};

const getUserJoinedPastEvents = async (
  userId: string,
  filters: JoinedEventFilters,
  options: Ioptions
) => {
  const { search, date } = filters;
  const { page, limit, skip } = calcultatepagination(options);

  const now = new Date();

  const whereCondition: any = {
    userId,

    event: {
      // only past events
      date: {
        lt: now,
      },

      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { location: { contains: search, mode: "insensitive" } },
        ],
      }),

      ...(date && {
        date: {
          gte: new Date(date + "T00:00:00"),
          lte: new Date(date + "T23:59:59"),
        },
      }),
    },
  };

  const joinedEvents = await prisma.eventParticipant.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy: {
      joinedAt: "desc",
    },
    include: {
      event: {
        include: {
          host: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  const total = await prisma.eventParticipant.count({
    where: whereCondition,
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: joinedEvents,
  };
};

export const ParticipantService = {
  jointEvents,
  addReview,
  getJoinedEvents,
  getUserJoinedPastEvents,
};
