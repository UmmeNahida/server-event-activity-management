import httpStatus from "http-status-codes";
import { prisma } from "../../../lib/prisma";
import { JwtPayload } from "jsonwebtoken";
import { IVerifiedUser } from "../../types/userType";
import { IEventStatus } from "../../types/eventType";
import AppError from "@/app/config/customizer/AppError";
import { calcultatepagination, Ioptions } from "@/app/helper/paginationHelper";
import { Prisma } from "@prisma/client";

const getAllEvents = async () => {
  const events = await prisma.event.findMany();
  return events;
};

const updateEventStatus = async (
  user: IVerifiedUser,
  eventId: string,
  status: IEventStatus
) => {
  const validStatus = ["OPEN", "CLOSED", "CANCELLED", "COMPLETED"];

  if (!validStatus.includes(status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid event status"
    );
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) throw new AppError(404, "Event not found");

  // HOST only can update their own event
  if (user.role === "HOST" && event.hostId !== user.id) {
    throw new AppError(403, "You cannot update this event");
  }

  // ADMIN bypass allowed
  const updated = await prisma.event.update({
    where: { id: eventId },
    data: { status },
  });

  return updated;
};

const getMyEvents = async (
  userInfo: JwtPayload,
  filters: any,
  options: Ioptions
) => {
  const { id, role } = userInfo;
  const { type, date, location, searchTerm } = filters;

  const { page, limit, skip, sortBy, sortOrder } =
    calcultatepagination(options);

  const eventWhereCondition: Prisma.EventWhereInput = {
    ...(searchTerm && {
      name: { contains: searchTerm, mode: "insensitive" },
    }),
    ...(type && {
      type: { contains: type, mode: "insensitive" },
    }),
    ...(location && {
      location: { contains: location, mode: "insensitive" },
    }),
    ...(date && {
      date: {
        gte: new Date(`${date}T00:00:00`),
        lte: new Date(`${date}T23:59:59`),
      },
    }),
  };

  // ================= HOST =================
  if (role === "HOST") {
    const where = {
      hostId: id,
      ...eventWhereCondition,
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: sortBy
          ? { [sortBy]: sortOrder }
          : { date: "desc" },
        select: {
          id: true,
          name: true,
          date: true,
          time: true,
          location: true,
          participantCount: true,
          maxParticipants: true,
          minParticipants: true,
          status: true,
          type: true,
          image: true,
          fee: true,
          description: true,
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    return {
      type: "HOST_EVENTS",
      meta: {
        page,
        limit,
        total,
      },
      events: events,
    };
  }

  // ================= USER =================
  if (role === "USER") {
    const where: Prisma.EventParticipantWhereInput = {
      userId: id,
      event: eventWhereCondition,
    };

    const [participants, total] = await Promise.all([
      prisma.eventParticipant.findMany({
        where,
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
                  email: true,
                  image: true,
                  role: true,
                },
              },
            },
          },
        },
      }),
      prisma.eventParticipant.count({ where }),
    ]);

    return {
      type: "JOINED_EVENTS",
      meta: {
        page,
        limit,
        total,
      },
      events: participants.map((p) => p.event),
    };
  }
};

const getMyReview = async (userInfo: JwtPayload) => {
  const { id, role } = userInfo;

  // USER → reviews given by user
  if (role === "USER") {
    const reviews = await prisma.review.findMany({
      where: { reviewerId: id },
      include: {
        event: true,
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      type: "USER_REVIEWS",
      reviews,
    };
  }

  // HOST → reviews for host's events
  if (role === "HOST") {
    const reviews = await prisma.review.findMany({
      where: {
        event: {
          hostId: id,
        },
      },
      include: {
        reviewer: {
          select: { id: true, name: true, image: true },
        },
        event: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      type: "HOST_RECEIVED_REVIEWS",
      reviews,
    };
  }
};

const getUpcomingEvents = (user: IVerifiedUser) => {
  const now = new Date();

  // USER → upcoming joined events
  if (user.role === "USER") {
    return prisma.event.findMany({
      where: {
        date: { gt: now },
        participants: {
          some: { userId: user.id },
        },
      },
      include: { host: true },
      orderBy: { date: "asc" },
    });
  }

  // HOST → upcoming hosted events
  if (user.role === "HOST") {
    return prisma.event.findMany({
      where: {
        date: { gt: now },
        hostId: user.id,
      },
      include: { participants: true },
      orderBy: { date: "asc" },
    });
  }

  // ADMIN → all upcoming events
  if (user.role === "ADMIN") {
    return prisma.event.findMany({
      where: { date: { gt: now } },
      orderBy: { date: "asc" },
    });
  }
};

const getEventHistory = async (user: IVerifiedUser) => {
  const now = new Date();
  console.log("user>>>:", user);

  if (user.role === "USER") {
    return await prisma.event.findMany({
      where: {
        date: { lt: now },
        participants: { some: { userId: user.id } },
      },
      include: { host: true },
      orderBy: { date: "desc" },
    });
  }

  if (user.role === "HOST") {
    return await prisma.event.findMany({
      where: {
        date: { lt: now },
        hostId: user.id,
      },
      include: { participants: true },
      orderBy: { date: "desc" },
    });
  }

  if (user.role === "ADMIN") {
    return await prisma.event.findMany({
      where: { date: { lt: now } },
      orderBy: { date: "desc" },
    });
  }
};

const singleEvent = async (
  id: string
): Promise<Partial<Event> | null> => {
  // console.log("id:", id)
  const result = await prisma.event.findUnique({
    where: {
      id,
    },
    include: {
      host: {
        select: {
          id: true,
          name: true,
          image: true,
          location: true,
          bio: true,
        },
      },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              location: true,
              hobbies: true,
              interests: true,
            },
          },
        },
      },
      reviews: {
        include: {
          reviewer: {
            select: {
              name: true,
              image: true,
              hobbies: true,
              interests: true,
            },
          },
        },
      },
      payments: { select: { status: true, amount: true } },
    },
  });

  return result;
};


const getEventParticipants = async (
  eventId: string,
  options: Ioptions
) => {
  const { page, limit, skip } = calcultatepagination(options);

  const whereCondition: Prisma.EventParticipantWhereInput = {
    eventId,
  };

  const participants = await prisma.eventParticipant.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy: {
      joinedAt: "desc",
    },
    select: {
      id: true,
      paid: true,
      joinedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          location: true,
        },
      },
    },
  });

  const total = await prisma.eventParticipant.count({
    where: whereCondition,
  });

  return {
    data: participants,
    meta: {
      page,
      limit,
      total,
    },
  };
};

export const EventService = {
  getAllEvents,
  getMyEvents,
  updateEventStatus,
  getMyReview,
  getUpcomingEvents,
  getEventHistory,
  singleEvent,
  getEventParticipants
};
