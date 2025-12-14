import { Role, UserStatus } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import {
  calcultatepagination,
  Ioptions,
} from "../../helper/paginationHelper";
import AppError from "@/app/customizer/AppErrror";

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
    const totalHosts = await prisma.user.count({
      where: { role: "HOST" },
    });
    const totalEvents = await prisma.event.count();
    const activeEvents = await prisma.event.count({
      where: { status: "OPEN" },
    });
    const completedEvents = await prisma.event.count({
      where: { status: "COMPLETED" },
    });
    const totalReports = await prisma.report.count({
      where: { status: "PENDING" },
    });

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

  getAllEvents: async (filters: EventFilter, options: Ioptions) => {
    const { type, date, location } = filters;
    const { page, limit, skip, sortBy, sortOrder } =
      calcultatepagination(options);

    const events = await prisma.event.findMany({
      where: {
        ...(type && {
          type: { contains: type, mode: "insensitive" },
        }),
        ...(location && {
          location: { contains: location, mode: "insensitive" },
        }),
        ...(date && {
          date: {
            gte: new Date(date + "T00:00:00"),
            lte: new Date(date + "T23:59:59"),
          },
        }),
        status: "OPEN",
      },
      skip: skip,
      take: limit,

      include: {
        host: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            userStatus: true,
          },
        },
      },

      orderBy: { [sortBy]: sortOrder },
    });

    const total = await prisma.event.count({
      where: {
        ...(type && {
          type: { contains: type, mode: "insensitive" },
        }),
        ...(location && {
          location: { contains: location, mode: "insensitive" },
        }),
        ...(date && {
          date: {
            gte: new Date(date + "T00:00:00"),
            lte: new Date(date + "T23:59:59"),
          },
        }),
        status: "OPEN",
      },
    });

    return {
      meta: { page, limit, total },
      data: events,
    };
  },

  paymentOverview: async () => {
    const totalRevenue = await prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    });

    const pending = await prisma.payment.aggregate({
      where: { status: "PENDING" },
      _sum: { amount: true },
    });

    const totalTransactions = await prisma.payment.count();
    const successful = await prisma.payment.count({
      where: { status: "PAID" },
    });

    const successRate = (successful / totalTransactions) * 100;

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingAmount: pending._sum.amount || 0,
      successRate,
    };
  },

  // ======================
  // USER MANAGEMENT
  // ======================
  getAllUsers: async (query: any, options: Ioptions) => {
    const { search, location, userStatus } = query;
    const { page, limit, skip, sortBy, sortOrder } =
      calcultatepagination(options);

    const where: any = { role: Role.USER };

    if (userStatus) {
      where.userStatus = {
        in: [
          "ACTIVE",
          "INACTIVE",
          "BLOCKED",
          "REQUESTED",
          "SUSPENDED",
        ],
      };
    }

    if (location)
      where.location = { contains: location, mode: "insensitive" };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { [sortBy]: sortOrder },
    });

    const total = await prisma.user.count({
      where,
    });

    return {
      meta: { page, limit, total },
      users,
    };
  },

  getUserById: async (id: string) => {
    return prisma.user.findUnique({ where: { id } });
  },

  updateUserStatus: async (id: string, status: UserStatus) => {
    return prisma.user.update({
      where: { id },
      data: { userStatus: status },
    });
  },

  deleteUser: async (id: string) => {
    return prisma.user.update({
      where: { id },
      data: { isDeleted: true, userStatus: "INACTIVE" },
    });
  },

  promoteToHost: async (email: string) => {
    
    const isExistHost = await prisma.user.findUnique({
      where: { email, role:Role.HOST}
    });

    if(isExistHost){
      throw new AppError(400,"you're already Host" )
    }

    const isRequestedToHost = await prisma.user.findUnique({
      where: { email, userStatus:UserStatus.REQUESTED}
    });

    if(isRequestedToHost){
      throw new AppError(400,"Please Waiting for admin approve" )
    }

    const user = await prisma.user.update({
      where: { email },
      data: { userStatus: UserStatus.REQUESTED },
    });
    return user;
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
  getAllHosts: async (query: any, options: Ioptions) => {
    const { search, userStatus, location } = query;
    const { page, limit, skip, sortBy, sortOrder } =
      calcultatepagination(options);

    const where: any = { role: "HOST" };

    if (userStatus) {
      where.userStatus = {
        in: [
          "ACTIVE",
          "INACTIVE",
          "BLOCKED",
          "REQUESTED",
          "SUSPENDED",
        ],
      };
    }

    if (userStatus) where.status = userStatus;
    if (location)
      where.location = { contains: location, mode: "insensitive" };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { [sortBy]: sortOrder },
    });

    const total = await prisma.user.count({
      where,
    });

    return {
      meta: { page, limit, total },
      users,
    };
  },

  getHostById: async (id: string) => {
    return prisma.user.findUnique({ where: { id } });
  },

  updateHostStatus: async (id: string, status: UserStatus) => {
    return prisma.user.update({
      where: { id },
      data: { userStatus: status },
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
        isRequestedHost: true,
      },
    });
  },

  rejectHost: async (id: string) => {
    return prisma.user.update({
      where: { id },
      data: {
        role: "USER",
        userStatus: "INACTIVE",
        isRequestedHost: false,
      },
    });
  },
};
