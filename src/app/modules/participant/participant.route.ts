import { Router } from "express";

import authCookies from "../../middleware/authCookies";
import { Role } from "@prisma/client";
import { ParticipantController } from "./participant.controller";

const router = Router();

router.post(
  "/joint-event/:id",
  authCookies(Role.USER, Role.HOST),
  ParticipantController.joinEvent
);

router.post(
  "/add-review",
  authCookies("USER"),
  ParticipantController.addReview
);

export const ParticipantRoutes = router;
