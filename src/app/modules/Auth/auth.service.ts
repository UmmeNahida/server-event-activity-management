import bcrypt from "bcrypt";
import { prisma } from "../../../lib/prisma";
import { generateToken } from "../../helper/jwtToken";
import { envVars } from "../../config/env";
import { fileUploader } from "../../helper/fileUploader";
import { Prisma, UserStatus } from "@prisma/client";
import AppError from "@/app/customizer/AppErrror";

export const registerUser = async (
  userData: Partial<Prisma.UserCreateInput>,
  file: any
) => {
  // console.log("user Payload", payload)
  const { password, ...rest } = userData;

  if (!password) throw new Error("Password is required");

  // // check user exists
  const exists = await prisma.user.findUnique({
    where: { email: userData.email! },
  });
  if (exists) throw new Error("User already exists");

  // upload file to cloudinary
  if (file) {
    const uploads = await fileUploader.uploadToCloudinary(file);
    userData.image = uploads!.secure_url as string;
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create user
  const user = await prisma.user.create({
    data: {
      name: userData.name!,
      email: userData.email!,
      role: userData.role!,
      bio: userData.bio,
      image: userData.image,
      interests: userData.interests,
      hobbies: userData.hobbies,
      location: userData.location,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      image: true,
      interests: true,
      hobbies: true,
      location: true,
      createdAt: true,
    },
  });

  return user;
};

export const loginUser = async (
  data: Partial<Prisma.UserCreateInput>
) => {
  const { email, password } = data;

  if (!email || !password)
    throw new Error("Email and password are required");

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) throw new Error("User not found with this email");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Your Password is incorrect");

  const payloadJwt = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  const accessToken = generateToken(
    payloadJwt,
    envVars.JWT_SECRET as string,
    envVars.JWT_EXPIRES_IN as string
  );
  const refreshToken = generateToken(
    payloadJwt,
    envVars.JWT_REFRESH_SECRET as string,
    envVars.JWT_EXPIRES_IN_REFRESH as string
  );

  return {
    accessToken,
    refreshToken,
    user: user,
  };
};


const changePassword = async (user: any, payload: any) => {
  //  console.log("payload:",payload)
    const userData = await prisma.user.findUnique({
        where: {
            email: user.email,
            userStatus: UserStatus.ACTIVE
        }
    });

    if(!userData){
      throw new AppError(400,"You're not a Active person so you need to Active First")
    }

    const isCorrectPassword: boolean = await bcrypt.compare(payload.oldPassword, userData.password);

    if (!isCorrectPassword) {
        throw new Error("Password incorrect!")
    }

    const hashedPassword: string = await bcrypt.hash(payload.newPassword, 10);

    await prisma.user.update({
        where: {
            email: userData.email
        },
        data: {
            password: hashedPassword,
            needPasswordChange: false
        }
    })

    return {
        message: "Password changed successfully!"
    }
};

export const AuthService = {
  registerUser,
  loginUser,
  changePassword
};
