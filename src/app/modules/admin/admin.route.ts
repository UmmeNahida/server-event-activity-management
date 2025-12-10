import { Router } from "express";
import { AdminController } from "./admin.controller";
import { Role } from "../../../../prisma/generated/prisma/enums";
import authCookies from "../../middleware/authCookies";

const router = Router()

// Only Admin
router.use(authCookies(Role.ADMIN));

router.get("/analytics",authCookies(Role.ADMIN), AdminController.analytics)

// EVENT MANAGEMENT
router.get("/all-events",authCookies(Role.ADMIN), AdminController.getAllEvents)

// USER MANAGEMENT
router.get("/users",authCookies(Role.ADMIN), AdminController.getAllUsers);
router.get("/users/:id",authCookies(Role.ADMIN), AdminController.getUserById);
router.patch("/users/status/:id",authCookies(Role.ADMIN), AdminController.updateUserStatus);
router.delete("/users/:id",authCookies(Role.ADMIN), AdminController.deleteUser);
router.patch("/users/promote/:id",authCookies(Role.ADMIN), AdminController.promoteToHost);
router.patch("/users/demote/:id",authCookies(Role.ADMIN), AdminController.demoteToUser);

// HOST MANAGEMENT
router.get("/hosts",authCookies(Role.ADMIN), AdminController.getAllHosts);
router.get("/hosts/:id",authCookies(Role.ADMIN), AdminController.getHostById);
router.patch("/hosts/status/:id",authCookies(Role.ADMIN), AdminController.updateHostStatus);
router.delete("/hosts/:id",authCookies(Role.ADMIN), AdminController.deleteHost);

export const AdminRoute = router;
