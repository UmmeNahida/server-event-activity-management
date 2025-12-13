
import { prisma } from "../../../lib/prisma";
import AppError from "../../customizer/AppErrror";


// get my profile
  const getMyProfile = async(userId: string, role: string)=> {

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
  }


  // update my profile
  const updateMyProfile = async(userId: string, data: any)=> {
    
    const existingUser = await prisma.user.findUnique({
      where: {id: userId}
    })

    if(!existingUser) {
       throw new AppError(404,"User not found");
    }

    const updatedUser = await prisma.user.update({
      where: {id: userId},
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
      }
    })

    return updatedUser;
  }

 // ---------- DELETE MY ACCOUNT ----------
  const deleteMyAccount = async(userId: string)=> {
    return prisma.user.delete({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }



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
  }



export const UserService = {
    getMyProfile,
    updateMyProfile,
    deleteMyAccount,
    createReport
}