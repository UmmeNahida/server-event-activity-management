import { prisma } from "../../../lib/prisma";
import {
  calcultatepagination,
  Ioptions,
} from "../../helper/paginationHelper";
import { parseISO, isValid, startOfDay, endOfDay } from "date-fns";

export const SavedEventService = {

  // create save event on DB
  saveEvent: async (userId: string, eventId: string) => {
    const result = await prisma.$transaction(async (tnx) => {
      await tnx.event.update({
        where: { id: eventId },
        data: { isSaved: true },
      });

      return tnx.savedEvent.create({
        data: {
          userId,
          eventId,
        },
      });
    });

    return result;
  },

  // remove save event on the DB
  removeSavedEvent: async (userId: string, eventId: string) => {
    // console.log("ids", userId,eventId)

    const result = await prisma.$transaction(async (tnx) => {
      await tnx.event.update({
        where: { id: eventId },
        data: { isSaved: false},
      });

      return await tnx.savedEvent.delete({
        where: {
          userId_eventId: {
            userId,
            eventId,
          },
        },
      });
    });

    return result
  },


  // get all save events by filtering and sorting
  getMySavedEvents: async (
    userId: string,
    options: Ioptions,
    filters: any
  ) => {
    const { page, limit, skip, sortBy, sortOrder } =
      calcultatepagination(options);

    const { search, date, location, type, fee } = filters;

    const eventAndConditions: any[] = [];

    // 🔍 search
    if (search) {
      eventAndConditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { location: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    // 📍 location
    if (location) {
      eventAndConditions.push({
        location: {
          contains: location,
          mode: "insensitive",
        },
      });
    }

    // 🏷️ type
    if (type) {
      eventAndConditions.push({
        type: {
          equals: type,
          mode: "insensitive",
        },
      });
    }

    // 📅 date (whole day)
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

    // 💰 fee range
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

    const savedEvent = await prisma.savedEvent.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        event: {
          include: {
            host: true,
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    bio: true,
                    interests: true,
                    hobbies: true,
                    role: true,
                    image: true,
                    location: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const total = await prisma.savedEvent.count({
      where: whereCondition,
    });

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: savedEvent,
    };
  },
};
