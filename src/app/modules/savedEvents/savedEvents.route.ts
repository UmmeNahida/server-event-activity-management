import express from "express";
import { SavedEventController } from "./savedEvents.controller";
import authCookies from "../../middleware/authCookies";
import { Role } from "@prisma/client";

const router = express.Router();

router.post(
  "/add/:eventId",
  authCookies(Role.USER),
  SavedEventController.saveEvent
);
router.delete(
  "/remove/:eventId",
  authCookies(Role.USER),
  SavedEventController.removeSavedEvent
);
router.get(
  "/my-saved",
  authCookies(Role.USER),
  SavedEventController.getMySavedEvents
);

export const SavedEventRoutes = router;
