import httpStatus from "http-status-codes";
import { prisma } from "../../../lib/prisma";
import AppError from "../../customizer/AppErrror";
import { Prisma } from "../../../../prisma/generated/prisma/client";
import { JwtPayload } from "jsonwebtoken";
import { IVerifiedUser } from "../../types/userType";
import { id } from "zod/v4/locales";


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


const updateEvent = async (eventId: string, userInfo: IVerifiedUser, updateInfo: Prisma.EventUpdateInput) => {
  
  // check if exist host
  const isExistHost = await prisma.event.findUniqueOrThrow({
    where: {id: eventId, hostId: userInfo.id}
   })

   // check permission
  if (isExistHost.hostId !== userInfo.id) {
    throw new AppError(403, "You are not allowed to edit this event");
  }

   const updateEvents = await prisma.event.update({
     where: {id: eventId, hostId:userInfo.id},
     data: updateInfo
   })

   return updateEvents;
   
};

const getAllEvents = async () => {
  const events = await prisma.event.findMany();
  return events;
}


const getMyEvents = async (userInfo: JwtPayload) => {

  const { id, role } = userInfo;

  if (role === "HOST") {
    const events = await prisma.event.findMany({
      where: { hostId: id },
      select: {
        id: true,
        name: true,
        date: true,
        time: true,
        location: true,
        participantCount: true,
        image: true,
        fee: true,
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }

      }
    });
    return {
      type: "HOST_EVENTS",
      events,
    };
  }

  // === User Logic ===
  if (role === "USER") {
    const events = await prisma.eventParticipant.findMany({
      where: { userId: id },
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
      orderBy: { joinedAt: "desc" },
    });

    // শুধু ইভেন্টগুলো রিটার্ন করবো
    return {
      type: "JOINED_EVENTS",
      events: events.map((p) => p.event),
    };
  }

}


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
            id:true,
            name: true,
            email: true,
            image: true,
          }
        }
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

}


const getUpcomingEvents =(user:IVerifiedUser) =>{
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
      orderBy: { date: "asc" }
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
      orderBy: { date: "asc" }
    });
  }

  // ADMIN → all upcoming events
  if (user.role === "ADMIN") {
    return prisma.event.findMany({
      where: { date: { gt: now } },
      orderBy: { date: "asc" }
    });
  }
}


const getEventHistory = async(user:IVerifiedUser) =>{
  const now = new Date();
  console.log("user>>>:", user)

  if (user.role === "USER") {
    return await prisma.event.findMany({
      where: {
        date: { lt: now },
        participants: { some: { userId: user.id } },
      },
      include: { host: true },
      orderBy: { date: "desc" }
    });
  }

  if (user.role === "HOST") {
    return await prisma.event.findMany({
      where: {
        date: { lt: now },
        hostId: user.id,
      },
      include: { participants: true },
      orderBy: { date: "desc" }
    });
  }

  if (user.role === "ADMIN") {
    return await prisma.event.findMany({
      where: { date: { lt: now } },
      orderBy: { date: "desc" }
    });
  }
}





export const EventService = {
  createEvent,
  getAllEvents,
  getMyEvents,
  getMyReview,
  updateEvent,
  getUpcomingEvents,
  getEventHistory
};