import { Router } from "express";
import { AdminController } from "./admin.controller";
import { Role } from "@prisma/client";
import authCookies from "../../middleware/authCookies";

const router = Router();

router.get(
  "/analytics",
  authCookies(Role.ADMIN),
  AdminController.analytics
);
router.get(
  "/payment-overview",
  authCookies(Role.ADMIN),
  AdminController.paymentOverview
);

// EVENT MANAGEMENT
router.get("/all-events", AdminController.getAllEvents);

// USER MANAGEMENT
router.get(
  "/users",
  authCookies(Role.ADMIN),
  AdminController.getAllUsers
);
router.get(
  "/users/:id",
  authCookies(Role.ADMIN),
  AdminController.getUserById
);
router.patch(
  "/users/status/:id",
  authCookies(Role.ADMIN),
  AdminController.updateUserStatus
);
router.delete(
  "/users/:id",
  authCookies(Role.ADMIN),
  AdminController.deleteUser
);
router.patch(
  "/users/promote/:email",
  AdminController.promoteToHost
);
router.patch(
  "/users/demote/:id",
  AdminController.demoteToUser
);

// HOST MANAGEMENT
router.get(
  "/hosts",
  authCookies(Role.ADMIN),
  AdminController.getAllHosts
);
router.get(
  "/hosts/:id",
  authCookies(Role.ADMIN),
  AdminController.getHostById
);
router.patch(
  "/hosts/status/:id",
  authCookies(Role.ADMIN),
  AdminController.updateHostStatus
);
router.delete(
  "/hosts/:id",
  authCookies(Role.ADMIN),
  AdminController.deleteHost
);
router.patch(
  "/approve-host/:id",
  authCookies(Role.ADMIN),
  AdminController.approveHost
);
router.patch(
  "/reject-host/:id",
  authCookies(Role.ADMIN),
  AdminController.rejectHost
);

export const AdminRoute = router;
