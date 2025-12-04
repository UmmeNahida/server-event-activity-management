import { Router } from "express";
import { UserController } from "./user.controller";
import authCookies from "../../middleware/authCookies";
import { Role } from "../../../../prisma/generated/prisma/enums";

const route = Router()

route.get("/me",authCookies(Role.ADMIN,Role.HOST,Role.USER), UserController.getMyProfile)
route.patch("/me",authCookies(Role.ADMIN,Role.HOST,Role.USER), UserController.updateMyProfile)
route.delete("/me",authCookies(Role.ADMIN,Role.HOST,Role.USER), UserController.deleteMyAccount)
route.get("/all-users",authCookies(Role.ADMIN), UserController.getAllUsers)

export const userRoute = route;

