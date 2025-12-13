import { prisma } from "../../../lib/prisma";
import { calcultatepagination, Ioptions } from "../../helper/paginationHelper";


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

  getMySavedEvents: async (userId: string,options:Ioptions) => {
    const { page, limit, skip, sortBy, sortOrder } = calcultatepagination(options);
    const savedEvent = await prisma.savedEvent.findMany({
      where: { userId },
      skip:skip,
      take:limit,
      orderBy:{[sortBy]:sortOrder},
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
      }
    });

    const total = await prisma.savedEvent.count({
      where:{userId}
    })

    return {
      meta:{total,page,limit},
      data: savedEvent
    }
  },

};
