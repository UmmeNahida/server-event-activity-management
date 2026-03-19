import express from "express";
import { SavedEventController } from "./savedEvents.controller";
import authCookies from "../../middleware/authCookies";
import { Role } from "@prisma/client";

const router = express.Router();

router.post(
  "/add/:eventId",
  authCookies(Role.USER,Role.HOST,Role.ADMIN),
  SavedEventController.saveEvent
);
router.delete(
  "/remove/:eventId",
  authCookies(Role.USER,Role.HOST,Role.ADMIN),
  SavedEventController.removeSavedEvent
);
router.get(
  "/my-saved",
  authCookies(Role.USER,Role.HOST,Role.ADMIN),
  SavedEventController.getMySavedEvents
);

export const SavedEventRoutes = router;
