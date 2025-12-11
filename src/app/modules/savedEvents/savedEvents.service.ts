import { prisma } from "../../../lib/prisma";


export const SavedEventService = {

  saveEvent: async (userId: string, eventId: string) => {
    return prisma.savedEvent.create({
      data: {
        userId,
        eventId,
      },
    });
  },

  removeSavedEvent: async (userId: string, eventId: string) => {
    return prisma.savedEvent.delete({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });
  },

  getMySavedEvents: async (userId: string) => {
    return prisma.savedEvent.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            host: true,
            participants: {
                include:{
                    user:{select:{
                        id:true,
                        name:true,
                        email:true,
                        bio:true,
                        interests:true,
                        hobbies:true,
                        role:true,
                        image:true,
                        location:true
                    }}
                }
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

};
