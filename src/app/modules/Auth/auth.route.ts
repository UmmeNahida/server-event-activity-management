import { Router } from "express";
import { AuthController } from "./auth.controller";

const route = Router()

route.post("/register",AuthController.createUser)
route.post("/login",AuthController.login)

export const authRoute = route;
