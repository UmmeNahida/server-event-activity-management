
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { SavedEventService } from "./savedEvents.service";
import { pick } from "../../helper/pick";
export const SavedEventController = {
  
  saveEvent: catchAsync(async (req:Request & JwtPayload, res:Response, next:NextFunction) => {
    const userId = req.user.id;
    const { eventId } = req.params;

    const data = await SavedEventService.saveEvent(userId, eventId);

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Event saved successfully",
      data,
    });
  }),

  removeSavedEvent: catchAsync(async (req:Request & JwtPayload, res:Response, next:NextFunction) => {
    const userId = req.user.id;
    const { eventId } = req.params;

    const data = await SavedEventService.removeSavedEvent(userId, eventId);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Event removed from saved list",
      data,
    });
  }),

  getMySavedEvents: catchAsync(async (req:Request & JwtPayload, res:Response, next:NextFunction) => {
    const userId = req.user.id;
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

    const data = await SavedEventService.getMySavedEvents(userId,options);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message:"Get My saved Events successfully",
      data,
    });
  }),
};
