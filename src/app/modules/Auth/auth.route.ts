import { Router } from "express";
import { AuthController } from "./auth.controller";
import { fileUploader } from "../../helper/fileUploader";
import { validationSchema } from "../../middleware/validationMiddleware";
import { userCreateSchema } from "./auth.validation";

const route = Router()

route.post("/register",
    fileUploader.upload.single('file'),
    validationSchema(userCreateSchema),
    AuthController.createUser
)

route.post("/login",AuthController.login)

export const authRoute = route;
