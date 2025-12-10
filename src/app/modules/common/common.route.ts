import { Router } from "express";
import { CommonController } from "./common.controller";

const route = Router()

route.get("/all-events",CommonController.getAllEvents);
route.get("/top-rated", CommonController.getTopRatedEvents);
route.get("/popular", CommonController.getPopularEvents);


export const CommonRoute = route;
