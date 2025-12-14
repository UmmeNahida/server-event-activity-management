import { Router } from "express";
import { UserController } from "./user.controller";
import authCookies from "../../middleware/authCookies";
import { Role } from "@prisma/client";
import { fileLoader } from "ejs";
import { fileUploader } from "@/app/helper/fileUploader";

const route = Router();

route.get(
  "/me",
  authCookies(Role.ADMIN, Role.HOST, Role.USER),
  UserController.getMyProfile
);
route.patch(
  "/update-my-profile",
  fileUploader.upload.single('file'),
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
