import httpStatus from "http-status-codes";
import { prisma } from "../../../lib/prisma";
import { v4 as uuidv4 } from 'uuid';
import AppError from "../../customizer/AppErrror";
import { Prisma } from "../../../../prisma/generated/prisma/client";
import { stripe } from "../../helper/stripe";



const createEvent = async (hostId: string, payload: Prisma.EventCreateInput) => {
  console.log("payload_host:", payload);

  // Host validation
  const host = await prisma.user.findFirst({
    where: { id: hostId, role: "HOST" },
  });

  if (!host) {
    throw new AppError(httpStatus.FORBIDDEN, "Only hosts can create events");
  }

  const {
    name,
    type,
    date,
    time,
    location,
    minParticipants,
    maxParticipants,
    description,
    image,
    fee,
  } = payload;

  if (minParticipants > maxParticipants) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "minParticipants cannot be greater than maxParticipants"
    );
  }

  const eventDateTime = time
  ? new Date(`${date}T${time}`)
  : new Date(`${date}T00:00`);


  const event = await prisma.event.create({
    data: {
      name,
      type,
      date: eventDateTime,
      time,
      location,
      minParticipants,
      maxParticipants,
      description,
      image,
      fee,
      host: { connect: { id: hostId } },
    },
  });

  return event;
};


const getAllEvents = async () => {
  const events = await prisma.event.findMany();
  return events;
}


const jointEvents = async (userId: string, eventId: string) => {

  const user = await prisma.user.findFirst({
    where: { id: userId, role: "USER" },
  })

  if (!user) {
    throw new AppError(httpStatus.FORBIDDEN, "Only users can join events");
  }

  // check already joined
const alreadyJoined = await prisma.eventParticipant.findFirst({
  where: { userId, eventId }
});

if (alreadyJoined) {
  throw new AppError(httpStatus.BAD_REQUEST, "You already joined this event");
}

// check existing payment
const existingPayment = await prisma.payment.findFirst({
  where: { userId, eventId }
});

if (existingPayment) {
  throw new AppError(httpStatus.BAD_REQUEST, "Payment already exists for this event");
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
    throw new AppError(httpStatus.BAD_REQUEST, "Cannot join past events");
  }

//  check max participants
  if (eventData.participantCount > eventData.maxParticipants) {
    throw new AppError(httpStatus.BAD_REQUEST, "Event has reached maximum participants");
  }

  // increment participant count
  const participantCount = eventData.participantCount + 1;

 
  const result = await prisma.$transaction(async (tnx) => {

    await tnx.event.update({
      where: { id: eventData.id },
      data: { participantCount}
    })

   const eventParticipant = await tnx.eventParticipant.create({
      data: {
        userId,
        eventId: eventData.id
      },
    });


    const transactionId = uuidv4();

    const paymentData = await tnx.payment.create({
      data: {
        userId: user.id,
        eventId: eventData.id,
        amount: eventData.fee,
        transactionId
      }
    })

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
        paymentId: paymentData.id
      },
      success_url: `https://www.programming-hero.com/`,
      cancel_url: `https://next.programming-hero.com/`,
    });
    console.log("session:", session)

    return {
      eventParticipant,
      paymentData,
      paymentUrl: session.url
    };
  })

  return result;
}

export const EventService = {
  createEvent,
  getAllEvents,
  jointEvents
};