import { Router } from "express";
import { userRoute } from "../modules/user/user.route";
import { authRoute } from "../modules/Auth/auth.route";
import { EventRoutes } from "../modules/events/event.route";
import { ParticipantRoutes } from "../modules/participant/participant.route";
import { AdminRoute } from "../modules/admin/admin.route";
import { CommonRoute } from "../modules/common/common.route";
import { HostRoute } from "../modules/host/host.route";
import { AdminReportRoutes } from "../modules/AdminReport/adminReport.route";
import { SavedEventRoutes } from "../modules/savedEvents/savedEvents.route";


export const router = Router();

const moduleRoutes = [
    {
        path:"/auth",
        route: authRoute
    },
    {
        path:"/users",
        route: userRoute
    },
    {
        path:"/events",
        route: EventRoutes
    },
    {
        path:"/participants",
        route: ParticipantRoutes
    },
    {
        path:"/admin",
        route: AdminRoute
    },
    {
        path:"/admin-report",
        route: AdminReportRoutes
    },
    {
        path:"/host",
        route: HostRoute
    },
    {
        path:"/common",
        route: CommonRoute
    },
    {
        path:"/saved-events",
        route: SavedEventRoutes
    },

]


moduleRoutes.forEach((route)=>{
    router.use(route.path, route.route)
})

export default router;
// router.use("/user", userRoute)
// router.use("/tour", tourRoute)
// router.use("/division", divisionRoute)
// router.use("/booking", bookingRoute)