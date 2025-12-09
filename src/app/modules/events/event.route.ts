import { Router } from "express";
import { EventController } from "./event.controller";
import authCookies from "../../middleware/authCookies";
import { Role } from "../../../../prisma/generated/prisma/enums";
import { validate } from "uuid";
import { EventCreateSchema } from "./event.validation";
import { validationSchema } from "../../middleware/validationMiddleware";


const router = Router();

router.post(
  "/",
  authCookies(Role.HOST),
  validationSchema(EventCreateSchema),
  EventController.createEvent
);

router.get(
  "/my-events",
  authCookies(Role.HOST, Role.USER),
  EventController.myEvents
);

export const EventRoutes = router;
