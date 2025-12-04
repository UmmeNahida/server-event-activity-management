import { Router } from "express";
import { EventController } from "./event.controller";
import authCookies from "../../middleware/authCookies";
import { Role } from "../../../../prisma/generated/prisma/enums";


const router = Router();

router.post(
  "/",
  authCookies(Role.HOST),
  EventController.createEvent
);

router.get(
  "/",
  EventController.allEvent
);
router.post(
  "/joint-event/:id",
  authCookies(Role.USER, Role.HOST),
  EventController.joinEvent
);

export const EventRoutes = router;
