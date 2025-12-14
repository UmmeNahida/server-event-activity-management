import { Router } from "express";
import authCookies from "../../middleware/authCookies";
import { Role } from "@prisma/client";
import { validationSchema } from "../../middleware/validationMiddleware";
import { EventCreateSchema } from "../events/event.validation";
import { HostController } from "./host.controller";
import { fileUploader } from "@/app/helper/fileUploader";

const router = Router();

// create_event(host)
router.post(
  "/create-event",
  fileUploader.upload.single('file'),
  authCookies(Role.HOST),
  validationSchema(EventCreateSchema),
  HostController.createEvent
);

// update_event(host)
router.get(
  "/edit/:id",
  authCookies(Role.HOST),
  HostController.updateEvent
);

//host analytics api for dashboard
router.get(
  "/analytics",
  authCookies("HOST"),
  HostController.getEventAnalytics
);

//payment overview
router.get(
  "/payment-overview",
  authCookies("HOST"),
  HostController.paymentOverview
);

export const HostRoute = router;
