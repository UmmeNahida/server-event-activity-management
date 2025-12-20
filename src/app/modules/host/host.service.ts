import { prisma } from "../../../lib/prisma";
import httpStatus from "http-status-codes";
import { IVerifiedUser } from "../../types/userType";
import { Prisma } from "@prisma/client";
import { fileUploader } from "@/app/helper/fileUploader";
import AppError from "@/app/config/customizer/AppError";

const createEvent = async (
  hostId: string,
  payload: Prisma.EventCreateInput,
  file: any
) => {
  // upload file to cloudinary
  if (file) {
    const uploads = await fileUploader.uploadToCloudinary(file);
    payload.image = uploads!.secure_url as string;
  }
  // console.log("payload_host:", payload);

  // Host validation
  const host = await prisma.user.findFirst({
    where: { id: hostId, role: "HOST" },
  });

  if (!host) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only hosts can create events"
    );
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

const getEventAnalytics = async (hostId: string) => {
  const hostedEvents = await prisma.event.findMany({
    where: { hostId },
    include: {
      participants: true,
      reviews: true,
    },
  });

  const hostReport = await prisma.report.findMany({
    where: { targetUserId: hostId },
  });

  const totalReports = hostReport.length;

  const totalEvents = hostedEvents.length;

  const upcoming = hostedEvents.filter(
    (e) => new Date(e.date) > new Date()
  ).length;

  const totalParticipants = hostedEvents.reduce(
    (sum, e) => sum + e.participants.length,
    0
  );

  const allRatings = hostedEvents.flatMap((e) =>
    e.reviews.map((r) => r.rating)
  );

  const avgRating =
    allRatings.length > 0
      ? (
          allRatings.reduce((a, b) => a + b, 0) / allRatings.length
        ).toFixed(2)
      : 0;

  // Revenue (optional)
  const payments = await prisma.payment.aggregate({
    where: {
      event: {
        hostId,
      },
    },
    _sum: { amount: true },
  });

  const monthly = await prisma.payment.groupBy({
    by: ["createAt"],
    where: {
      event: {
        host: { id: hostId },
      },
      status: "PAID",
    },
    _sum: { amount: true },
  });

  return {
    totalEvents,
    upcoming,
    totalParticipants,
    avgRating,
    totalReports,
    revenue: payments._sum.amount || 0,
    monthlyEarnings: monthly,
  };
};

const updateEvent = async (
  eventId: string,
  userInfo: IVerifiedUser,
  updateInfo: Prisma.EventUpdateInput,
  file: any
) => {
  // check if exist host
  const isExistHost = await prisma.event.findUniqueOrThrow({
    where: { id: eventId, hostId: userInfo.id },
  });

  const { date, time, ...restUpdateInfo } = updateInfo as any;

  // check permission
  if (isExistHost.hostId !== userInfo.id) {
    throw new AppError(403, "You are not allowed to edit this event");
  }

  // upload file to cloudinary
  if (file) {
    const uploads = await fileUploader.uploadToCloudinary(file);
    restUpdateInfo.image = uploads!.secure_url as string;
  }

  let eventDateTime;
  if (date && time) {
    eventDateTime = time
      ? new Date(`${date}T${time}`)
      : new Date(`${date}T00:00:00`);
  }

  const updateEvents = await prisma.event.update({
    where: {
      id: eventId,
      hostId: userInfo.id,
    },
    data: {
      ...restUpdateInfo,
      time: time,
      date: eventDateTime,
    },
  });

  return updateEvents;
};

const paymentOverview = async (hostId: string) => {
  const hostedEvents = await prisma.event.findMany({
    where: { hostId },
    include: {
      participants: true,
      reviews: true,
    },
  });

  const allRatings = hostedEvents.flatMap((e) =>
    e.reviews.map((r) => r.rating)
  );

  const avgRating =
    allRatings.length > 0
      ? (
          allRatings.reduce((a, b) => a + b, 0) / allRatings.length
        ).toFixed(2)
      : 0;

  const totalEarnings = await prisma.payment.aggregate({
    where: {
      event: {
        host: { id: hostId },
      },
      status: "PAID",
    },
    _sum: { amount: true },
  });

  const pending = await prisma.payment.aggregate({
    where: {
      event: {
        host: { id: hostId },
      },
      status: "PENDING",
    },
    _sum: { amount: true },
  });

  const monthly = await prisma.payment.groupBy({
    by: ["createAt"],
    where: {
      event: {
        host: { id: hostId },
      },
      status: "PAID",
    },
    _sum: { amount: true },
  });

  return {
    avgRating,
    totalEarnings: totalEarnings._sum.amount || 0,
    pending: pending._sum.amount || 0,
    monthlyEarnings: monthly,
  };
};

export const HostService = {
  getEventAnalytics,
  createEvent,
  updateEvent,
  paymentOverview,
};
