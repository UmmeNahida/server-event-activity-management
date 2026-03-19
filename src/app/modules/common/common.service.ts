import { EventStatus, Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import {
  calcultatepagination,
  Ioptions,
} from "../../helper/paginationHelper";
import { eventSearchableField } from "./event.constant";

interface EventFilter {
  type?: string;
  date?: string;
  location?: string;
  searchTerm?: string | "";
  status?: EventStatus;
  minFee?: number;
  maxFee?: number;
  fee?: number;
}

const getAllEvents = async (
  userId: string | null, // optional user
  filters: EventFilter,
  options: Ioptions
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    calcultatepagination(options);

  const {
    searchTerm,
    type,
    date,
    minFee,
    maxFee,
    fee,
    location,
    status,
    ...rest
  } = filters;

  const andConditions: Prisma.EventWhereInput[] = [];

  // 🔍 SEARCH
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

  // 📅 DATE
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

  // 📌 STATUS
  if (status) {
    andConditions.push({
      status,
    });
  }

  // 💰 EXACT FEE
  if (fee !== undefined) {
    andConditions.push({
      fee: {
        lte: Number(fee),
      },
    });
  }

  // 💰 RANGE FEE
  if (minFee || maxFee) {
    andConditions.push({
      fee: {
        gte: minFee ? Number(minFee) : undefined,
        lte: maxFee ? Number(maxFee) : undefined,
      },
    });
  }

  // 🏷️ TYPE
  if (type) {
    andConditions.push({
      type: {
        contains: type,
        mode: "insensitive",
      },
    });
  }

  // 📍 LOCATION
  if (location) {
    andConditions.push({
      location: {
        contains: location,
        mode: "insensitive",
      },
    });
  }

  // ⚙️ OTHER FILTERS
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

  // =========================
  // 🔥 MAIN QUERY
  // =========================
  const events = await prisma.event.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      host: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },

      // 👉 only current user saved info
      savedEvents: userId
        ? {
            where: { userId },
            select: { id: true },
          }
        : false,
    },
  });

  // =========================
  // 🔥 FORMAT RESPONSE
  // =========================
  const formattedEvents = events.map((event) => {
    const { savedEvents, ...restEvent } = event;

    return {
      ...restEvent,
      isSaved: userId ? savedEvents.length > 0 : false,
    };
  });

  const total = await prisma.event.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: formattedEvents,
  };
};

const getTopRatedEvents = async () => {
  // Get top 10 event IDs by average review rating
  const topEvents = await prisma.review.groupBy({
    by: ["eventId"],
    _avg: { rating: true },
    orderBy: {
      _avg: {
        rating: "desc",
      },
    },
    take: 10,
  });

  const eventIds = topEvents.map((e) => e.eventId);

  // Fetch event details for those IDs
  return prisma.event.findMany({
    where: { id: { in: eventIds } },
    include: {
      host: true,
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  });
};

// popular events
const getPopularEvents = () => {
  return prisma.event.findMany({
    where: {
      date: { gt: new Date() },
    },
    include: {
      participants: true,
      host: true,
    },
    orderBy: [{ participantCount: "desc" }, { date: "asc" }],
    take: 10,
  });
};

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
  getPopularEvents,
};
