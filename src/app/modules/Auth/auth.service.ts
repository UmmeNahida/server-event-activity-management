import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../../lib/prisma";
import { Prisma } from "../../../../generated/prisma/client";
import { generateToken } from "../../helper/jwtToken";
import { envVars } from "../../config/env";


export const registerUser = async (data: Prisma.UserCreateInput) => {
  const {password,...rest } = data;

  // check user exists
  const exists = await prisma.user.findUnique({ where: {email: rest.email!}})
  if (exists) throw new Error("User already exists");

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create user
  const user = await prisma.user.create({
    data: {
      ...rest,
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



export const loginUser = async (data: Partial<Prisma.UserCreateInput>) => {
  const { email, password } = data;

  if (!email || !password) throw new Error("Email and password are required");

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) throw new Error("User not found");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

const payloadJwt = {
        id: user.id,
        email: user.email,
        role: user.role
    }
    const accessToken = generateToken(payloadJwt, envVars.JWT_SECRET as string, envVars.JWT_EXPIRES_IN as string)
    const refreshToken = generateToken(payloadJwt, envVars.JWT_REFRESH_SECRET as string, envVars.JWT_EXPIRES_IN_REFRESH as string)

  return {
    accessToken,
    refreshToken,
    user: {user},
  };
};

export const AuthService = {
  registerUser,
  loginUser,
};