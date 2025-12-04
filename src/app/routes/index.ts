import { Router } from "express";
import { userRoute } from "../modules/user/user.route";
import { authRoute } from "../modules/Auth/auth.route";
import { EventRoutes } from "../modules/events/event.route";


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

]


moduleRoutes.forEach((route)=>{
    router.use(route.path, route.route)
})

export default router;
// router.use("/user", userRoute)
// router.use("/tour", tourRoute)
// router.use("/division", divisionRoute)
// router.use("/booking", bookingRoute)