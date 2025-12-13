import { Router } from "express";
import { UserController } from "./user.controller";
import authCookies from "../../middleware/authCookies";
import { Role } from "@prisma/client";

const route = Router();

route.get(
  "/me",
  authCookies(Role.ADMIN, Role.HOST, Role.USER),
  UserController.getMyProfile
);
route.patch(
  "/me",
  authCookies(Role.ADMIN, Role.HOST, Role.USER),
  UserController.updateMyProfile
);
route.delete(
  "/me",
  authCookies(Role.ADMIN, Role.HOST, Role.USER),
  UserController.deleteMyAccount
);
route.post(
  "/create-report",
  authCookies(Role.HOST, Role.USER),
  UserController.createReport
);

export const userRoute = route;
