import httpStatus from "http-status-codes";
import { prisma } from "../../../lib/prisma";
import AppError from "../../customizer/AppErrror";
import { v4 as uuidv4 } from "uuid";
import { stripe } from "../../helper/stripe";
import { JwtPayload } from "jsonwebtoken";
import { IReview } from "../../types/userType";



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
    where: { userId, eventId, status:"PAID"}
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
      data: { participantCount }
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
        status:"PENDING",
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


const addReview = async(user: JwtPayload, payload: IReview)=> {
  const { eventId, rating, comment } = payload;


  // 1. Check user participated
  const participated = await prisma.eventParticipant.findFirst({
    where: {
      eventId,
      userId: user.id,
    },
  });

  if (!participated) {
    throw new AppError(400, "You cannot review an event you didn't join!");
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
  if(rating > 5){
    throw new AppError(httpStatus.BAD_REQUEST, "please give 5 ratings")
  }

  // 3. Create review
  const review = await prisma.review.create({
    data: {
      rating,
      comment,
      eventId,
      reviewerId: user.id,
      hostId:event.hostId
    },
  });

  return review;
}



export const ParticipantService = {
  jointEvents,
  addReview
};