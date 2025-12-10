import express from "express";
import authCookies from "../../middleware/authCookies";
import { Role } from "../../../../prisma/generated/prisma/enums";
import { AdminReportController } from "./adminReport.controller";

const router = express.Router();
router.use(authCookies(Role.ADMIN));

router.get("/reports", AdminReportController.getAllReports);
router.get("/reports/:id", AdminReportController.getSingleReport);
router.patch("/reports/action/:id", AdminReportController.takeAction);

export const AdminReportRoutes = router;
