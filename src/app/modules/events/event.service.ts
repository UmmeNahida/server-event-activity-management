import httpStatus from "http-status-codes";
import { prisma } from "../../../lib/prisma";
import AppError from "../../customizer/AppErrror";
import { JwtPayload } from "jsonwebtoken";
import { IVerifiedUser } from "../../types/userType";
import { IEventStatus } from "../../types/eventType";



const getAllEvents = async () => {
  const events = await prisma.event.findMany();
  return events;
}


const updateEventStatus = async(user:IVerifiedUser, eventId:string, status:IEventStatus)=> {
  const validStatus = ["OPEN", "CLOSED", "CANCELLED", "COMPLETED"];

  if (!validStatus.includes(status)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid event status");
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });

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
        maxParticipants:true,
        minParticipants:true,
        status:true,
        type:true,
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

    // return event
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

const singleEvent = async (id: string): Promise<Partial<Event> | null> => {
    console.log("id:", id)
    const result = await prisma.event.findUnique({
        where: {
            id,
        },
        include: {
            host: {
                select: {
                    id: true,
                    name:true,
                    image:true,
                    location:true,
                    bio:true
                },
            },
            participants: {
                include: {
                    user:{select:{id:true,name:true,image:true,location:true,hobbies:true,interests:true}}
                }
            },
            reviews:{include:{reviewer:{select:{name:true,image:true,hobbies:true,interests:true}}}},
            payments:{select:{status:true,amount:true}}
        },
    });
    
    return result
};




export const EventService = { 
  getAllEvents,
  getMyEvents,
  updateEventStatus,
  getMyReview,
  getUpcomingEvents,
  getEventHistory,
  singleEvent,
};