
import { Prisma } from "../../../../prisma/generated/prisma/client";
import { prisma } from "../../../lib/prisma";
import { calcultatepagination, Ioptions } from "../../helper/paginationHelper";
import { eventSearchableField } from "./event.constant";


interface EventFilter {
    type?: string;
    date?: string;
    location?: string;
    searchTerm?: string | "",
    status?:string,
    minFee?:number,
    maxFee?:number,
    fee?:number
}

// const getAllEvents = async (filters: EventFilter) => {
//     const { type, date, location } = filters;

//     const events = await prisma.event.findMany({
//         where: {
//             ...(type && { type: { contains: type, mode: "insensitive" } }),
//             ...(location && { location: { contains: location, mode: "insensitive" } }),
//             ...(date && {
//                 date: {
//                     gte: new Date(date + "T00:00:00"),
//                     lte: new Date(date + "T23:59:59"),
//                 },
//             }),
//             status: "OPEN",
//         },

//         include: {
//             host: {
//                 select: { id: true, name: true, image: true },
//             },
//         },

//         orderBy: { date: "asc" },
//     });

//     return events
// }
const getAllEvents = async (filters: EventFilter, options: Ioptions) => {
    const { page, limit, skip, sortBy, sortOrder } = calcultatepagination(options);
    const { searchTerm,type, date, minFee, maxFee, fee, location, ...rest } = filters;

    const andConditions: Prisma.EventWhereInput[] = [];

    // -------------------------------
    // 1) SEARCH TERM (STRING FIELDS: time, location, type)
    // -------------------------------
    if (searchTerm && typeof searchTerm === "string") {
        andConditions.push({
            OR: eventSearchableField.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }

    // -------------------------------
    // 2) DATE FILTERING (YYYY-MM-DD)
    // -------------------------------
    if (date) {
        const start = new Date(`${date}T00:00:00.000Z`);
        const end = new Date(`${date}T23:59:59.999Z`);

        andConditions.push({
            date: {
                gte: start,
                lte: end,
            },
        });
    }

    // -------------------------------
    // 3) EXACT FEE
    // -------------------------------
    if (fee !== undefined) {
        andConditions.push({
            fee: {
                lte: Number(fee),
            },
        });
    }

    // -------------------------------
    // 4) MIN/MAX FEE
    // -------------------------------
    if (minFee || maxFee) {
        andConditions.push({
            fee: {
                gte: minFee ? Number(minFee) : undefined,
                lte: maxFee ? Number(maxFee) : undefined,
            },
        });
    }

    // -------------------------------
    // 5) type or category FILTER
    // -------------------------------
    if (type) {
        andConditions.push({
            type: {
                contains: type,
                mode: "insensitive",
            },
        });
    }

    if (location) {
        andConditions.push({
            location: {
                contains: location,
                mode: "insensitive",
            },
        });
    }

    // -------------------------------
    // 6) REMAINING EXACT MATCH FILTERS
    // -------------------------------
    if (Object.keys(rest).length > 0) {
        Object.keys(rest).forEach((key) => {
            andConditions.push({
                [key]: {
                    equals: (rest as any)[key],
                },
            });
        });
    }

    const whereConditions: Prisma.EventWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const events = await prisma.event.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
            host: { select: { id: true, name: true, image: true } },
        },
    });

    const total = await prisma.event.count({ where: whereConditions });

    return {
        meta: { total, page, limit },
        data: events,
    };
};

const getTopRatedEvents = async () => {
  // Get top 10 event IDs by average review rating
  const topEvents = await prisma.review.groupBy({
    by: ['eventId'],
    _avg: { rating: true },
    orderBy: {
      _avg: {
        rating: 'desc'
      }
    },
    take: 10
  });

  const eventIds = topEvents.map(e => e.eventId);

  // Fetch event details for those IDs
  return prisma.event.findMany({
    where: { id: { in: eventIds } },
    include: {
      host: true,
      reviews: {
        select: {
          rating: true
        }
      }
    }
  });
}

// popular events
const getPopularEvents=()=> {
  return prisma.event.findMany({
    where: {
      date: { gt: new Date() }
    },
    include: {
      participants: true,
      host: true
    },
    orderBy: [
      {participantCount: "desc" },
      { date: "asc" }
    ],
    take: 10
  });
}


// nearby data
// const getNearbyEvents =async ({ lat, lng, radius })=> {
//   const events = await prisma.event.findMany({
//     where: {
//       status: "OPEN"
//     },
//     include: {
//       host: true
//     }
//   });

//   const EARTH_RADIUS = 6371; // KM

//   const filtered = events.filter(event => {
//     if (!event.latitude || !event.longitude) return false;

//     const dLat = (event.latitude - lat) * Math.PI / 180;
//     const dLng = (event.longitude - lng) * Math.PI / 180;

//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(lat * Math.PI / 180) *
//       Math.cos(event.latitude * Math.PI / 180) *
//       Math.sin(dLng / 2) * Math.sin(dLng / 2);

//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//     const distance = EARTH_RADIUS * c;

//     return distance <= radius;
//   });

//   return filtered;
// }



export const CommonService = {
    getAllEvents,
    getTopRatedEvents,
    getPopularEvents
}
