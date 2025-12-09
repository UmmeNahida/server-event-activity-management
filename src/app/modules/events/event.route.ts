import { Router } from "express";
import { EventController } from "./event.controller";
import authCookies from "../../middleware/authCookies";
import { Role } from "../../../../prisma/generated/prisma/enums";
import { validate } from "uuid";
import { EventCreateSchema } from "./event.validation";
import { validationSchema } from "../../middleware/validationMiddleware";


const router = Router();

// create_event(host)
router.post(
  "/",
  authCookies(Role.HOST),
  validationSchema(EventCreateSchema),
  EventController.createEvent
);

// update_event(host)
router.get(
  "/edit/:id",
  authCookies(Role.HOST),
  EventController.updateEvent
);

//My-review(host,user)
router.get(
  "/my-review",
  authCookies("USER","HOST"),
  EventController.getMyReview
)

// common(user,host)
router.get(
  "/my-events",
  authCookies(Role.HOST, Role.USER),
  EventController.myEvents
);

// common(user,host,admin)
router.get(
  "/upcoming",
  authCookies("USER", "HOST", "ADMIN"),
  EventController.getUpcomingEvents
);

//common(user,host,admin)
router.get(
  "/history",
  authCookies("USER", "HOST", "ADMIN"),
  EventController.getEventHistory
);


export const EventRoutes = router;
