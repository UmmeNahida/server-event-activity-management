import { Router } from "express";
import { AdminController } from "./admin.controller";
import { Role } from "../../../../prisma/generated/prisma/enums";
import authCookies from "../../middleware/authCookies";

const router = Router()

// Only Admin
router.use(authCookies(Role.ADMIN));

// EVENT MANAGEMENT
router.get("/all-events", AdminController.getAllEvents)

// USER MANAGEMENT
router.get("/users", AdminController.getAllUsers);
router.get("/users/:id", AdminController.getUserById);
router.patch("/users/status/:id", AdminController.updateUserStatus);
router.delete("/users/:id", AdminController.deleteUser);
router.patch("/users/promote/:id", AdminController.promoteToHost);
router.patch("/users/demote/:id", AdminController.demoteToUser);

// HOST MANAGEMENT
router.get("/hosts", AdminController.getAllHosts);
router.get("/hosts/:id", AdminController.getHostById);
router.patch("/hosts/status/:id", AdminController.updateHostStatus);
router.delete("/hosts/:id", AdminController.deleteHost);

export const AdminRoute = router;
