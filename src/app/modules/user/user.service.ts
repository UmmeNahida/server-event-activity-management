import { fileUploader } from "@/app/helper/fileUploader";
import { prisma } from "../../../lib/prisma";
import AppError from "@/app/config/customizer/AppError";
import httpStatus from "http-status";

// get my profile
const getMyProfile = async (userId: string, role: string) => {
  // Base fields — visible to ALL roles (User, Host, Admin)
  const baseSelect: any = {
    id: true,
    name: true,
    email: true,
    bio: true,
    image: true,
    interests: true,
    hobbies: true,
    location: true,
    role: true,
    createdAt: true,

    // Own data — all roles can see
    reviewsGiven: true,
    eventsJoined: {
      include: {
        event: true,
      },
    },
    payments: true,
  };

  // Role-based additional data
  if (role === "HOST") {
    baseSelect.eventsHosted = true;
    baseSelect.reviewsReceived = true;
  }

  if (role === "ADMIN") {
    baseSelect.eventsHosted = true;
    baseSelect.reviewsReceived = true;
    // admin future fields here if needed
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: baseSelect,
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// update my profile
const updateMyProfile = async (
  userId: string,
  data: any,
  file: any
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new AppError(404, "User not found");
  }

  if (file) {
    const uploads = await fileUploader.uploadToCloudinary(file);
    data.image = uploads!.secure_url as string;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: data,
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      image: true,
      interests: true,
      hobbies: true,
      location: true,
      role: true,
      createdAt: true,
    },
  });

  return updatedUser;
};

// ---------- DELETE MY ACCOUNT ----------
const deleteMyAccount = async (userId: string) => {
  return prisma.user.delete({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
};

const createReport = async (reporterId: string, payload: any) => {
  const { targetUserId, targetEventId, reason } = payload;

  return prisma.report.create({
    data: {
      reporterId,
      targetUserId,
      targetEventId,
      reason,
    },
  });
};

const getUserById = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      isDeleted: false,
      userStatus: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      image: true,
      location: true,
      interests: true,
      hobbies: true,
      role: true,
      isRequestedHost: true,
      createdAt: true,

      // Relations
      eventsHosted: {
        select: {
          id: true,
          name: true,
          date: true,
          location: true,
        },
      },
      eventsJoined: {
        select: {
          id: true,
          paid: true,
          joinedAt: true,
          event: {
            select: {
              id: true,
              name: true,
              date: true,
            },
          },
        },
      },
      reviewsReceived: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          reviewer: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

export const UserService = {
  getMyProfile,
  updateMyProfile,
  deleteMyAccount,
  createReport,
  getUserById
};
