import { UserStatus } from "../../../../prisma/generated/prisma/enums";
import { prisma } from "../../../lib/prisma";


interface EventFilter {
    type?: string;
    date?: string;
    location?: string;
}

// interface HostInfo {
//     id: string;
//     name: string;
//     image: string;
// }

// interface EventWithHost {
//     id: string;
//     type: string;
//     date: Date;
//     location: string;
//     status: string;
//     host: HostInfo;
//     // Add other event fields as needed
// }


export const AdminService = {

// ADMIN ANALYTICS 
analytics: async () => {
    const totalUsers = await prisma.user.count();
    const totalHosts = await prisma.user.count({ where: { role: "HOST" } });
    const totalEvents = await prisma.event.count();
    const activeEvents = await prisma.event.count({ where: { status: "OPEN" } });
    const completedEvents = await prisma.event.count({ where: { status: "COMPLETED" } });
    const totalReports = await prisma.report.count({ where: { status: "PENDING" } });

    const monthlyRegistrations = await prisma.user.groupBy({
      by: ["createdAt"],
      _count: { id: true },
    });

    return {
      totalUsers,
      totalHosts,
      totalEvents,
      activeEvents,
      completedEvents,
      totalReports,
      monthlyRegistrations,
    };
  },
  
// ====================
// EVENT MANAGEMENT
// ===================

  getAllEvents: async (filters: EventFilter) => {
    const { type, date, location } = filters;

    const events = await prisma.event.findMany({
        where: {
            ...(type && { type: { contains: type, mode: "insensitive" } }),
            ...(location && { location: { contains: location, mode: "insensitive" } }),
            ...(date && {
                date: {
                    gte: new Date(date + "T00:00:00"),
                    lte: new Date(date + "T23:59:59"),
                },
            }),
            status: "OPEN",
        },

        include: {
            host: {
                select: { id: true, name: true, image: true },
            },
        },

        orderBy: { date: "asc" },
    });

    return events
},

  // ======================
  // USER MANAGEMENT
  // ======================
  getAllUsers: async (query: any) => {
    const { search, location, page = 1, limit = 10 } = query;

    const where: any = {
      role: "USER",
    };

    if (location) where.location = { contains: location, mode: "insensitive" };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const users = await prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
    });

    return users;
  },

  getUserById: async (id: string) => {
    return prisma.user.findUnique({ where: { id } });
  },

  updateUserStatus: async (id: string, status: UserStatus) => {
    return prisma.user.update({
      where: { id },
      data: { userStatus:status },
    });
  },

  deleteUser: async (id: string) => {
    return prisma.user.update({
      where: { id },
      data: { isDeleted: true, userStatus: "INACTIVE" },
    });
  },

  promoteToHost: async (id: string) => {
    return prisma.user.update({
      where: { id },
      data: { role: "HOST" },
    });
  },

  demoteToUser: async (id: string) => {
    return prisma.user.update({
      where: { id },
      data: { role: "USER" },
    });
  },

  // ======================
  // HOST MANAGEMENT
  // ======================
  getAllHosts: async (query: any) => {
    const { search, userStatus, location, page = 1, limit = 10 } = query;

    const where: any = { role: "HOST" };

    if (userStatus) where.status = userStatus;
    if (location) where.location = { contains: location, mode: "insensitive" };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    return prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
    });
  },

  getHostById: async (id: string) => {
    return prisma.user.findUnique({ where: { id } });
  },

  updateHostStatus: async (id: string, status: UserStatus) => {
    return prisma.user.update({
      where: { id },
      data: { userStatus:status },
    });
  },

  deleteHost: async (id: string) => {
    return prisma.user.update({
      where: { id },
      data: { isDeleted: true, userStatus: "INACTIVE" },
    });
  },

  approveHost: async (id: string) => {
    return prisma.user.update({
      where: { id },
      data: {
        role: "HOST",
        userStatus: "ACTIVE",
      },
    });
  },
  rejectHost: async (id: string) => {
    return prisma.user.update({
      where: { id },
      data: {
        role: "USER",
        userStatus: "INACTIVE",
      },
    });
  },
};

