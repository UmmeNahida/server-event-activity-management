import { Router } from "express";
import { CommonController } from "./common.controller";
import optionalAuth from "../../middleware/optionalAuth";

const route = Router();

route.get("/all-events", optionalAuth, CommonController.getAllEvents);
route.get("/top-rated", CommonController.getTopRatedEvents);
route.get("/popular", CommonController.getPopularEvents);

export const CommonRoute = route;
