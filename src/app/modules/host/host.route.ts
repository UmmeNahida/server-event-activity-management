
import { Router } from "express";
import authCookies from "../../middleware/authCookies";
import { Role } from "../../../../prisma/generated/prisma/enums";
import { validationSchema } from "../../middleware/validationMiddleware";
import { EventCreateSchema } from "../events/event.validation";
import { HostController } from "./host.controller";

const router = Router()

// create_event(host)
router.post(
  "/",
  authCookies(Role.HOST),
  validationSchema(EventCreateSchema),
  HostController.createEvent
);

//host analytics api for dashboard
router.get("/analytics", authCookies("HOST"), HostController.getEventAnalytics);


// update_event(host)
router.get(
  "/edit/:id",
  authCookies(Role.HOST),
 HostController.updateEvent
);



export const HostRoute = router;
