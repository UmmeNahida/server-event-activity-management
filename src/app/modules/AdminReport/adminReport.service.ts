import { prisma } from "../../../lib/prisma";


export const AdminReportService = {

  getAllReports: async (query: any) => {
    return prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reporter: true,
        targetUser: true,
        targetEvent: true,
      },
    });
  },

  getSingleReport: async (id: string) => {
    return prisma.report.findUnique({
      where: { id },
      include: {
        reporter: true,
        targetUser: true,
        targetEvent: true,
      },
    });
  },

  // Admin action
  takeAction: async (id: string, body: any) => {
    const { action, notes } = body;

    const report = await prisma.report.update({
      where: { id },
      data: {
        status: "ACTION_TAKEN",
      },
    });

    // Action types:
    // SUSPEND_USER, REMOVE_EVENT, WARN_HOST
    if (action === "SUSPEND_USER") {
      await prisma.user.update({
        where: { id: report.targetUserId! },
        data: { userStatus: "SUSPENDED" },
      });
    }

    if (action === "REMOVE_EVENT") {
      await prisma.event.update({
        where: { id: report.targetEventId! },
        data: { status: "CANCELLED" },
      });
    }

    if (action === "WARN_HOST") {
      // add a warning counter later if needed
    }

    return { message: "Action executed successfully", report };
  },
};
