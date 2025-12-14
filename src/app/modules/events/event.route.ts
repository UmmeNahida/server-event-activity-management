import { Router } from "express";
import { EventController } from "./event.controller";
import authCookies from "../../middleware/authCookies";
import { Role } from "@prisma/client";
// import { Role } from "@prisma/client";

const router = Router();

// updated evenst status (host, admin)
router.patch(
  "/status/:id",
  authCookies("HOST", "ADMIN"),
  EventController.updateEventStatus
);

// get single event
router.get(
  "/event-details/:id",
  authCookies("HOST", "USER"),
  EventController.singleEvent
);

//My-review(host,user)
router.get(
  "/my-review",
  authCookies("USER", "HOST"),
  EventController.getMyReview
);

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
