import { NextFunction, Request, Response } from "express"
import httpStatus from "http-status-codes"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import { EventService } from "./event.service"
import { JwtPayload } from "jsonwebtoken"
import { join } from "node:path"

const createEvent = catchAsync(async(req:Request & JwtPayload,res:Response, next:NextFunction)=>{
   
   const hostId = req.user.id; // From JWT
    const payload = req.body;
    console.log("req user", req.user)

    const result = await EventService.createEvent(hostId, payload);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Event created successfully",
      data: result,
    });
})


const allEvent = catchAsync(async(req:Request & JwtPayload,res:Response, next:NextFunction)=>{
   
    // const hostId = req.user.id; // From JWT
    const result = await EventService.getAllEvents();

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "All Events Retrieve successfully",
      data: result,
    });
})


const joinEvent = catchAsync(async(req:Request & JwtPayload,res:Response, next:NextFunction)=>{

   const userId = req.user.id; // From JWT
   const eventId = req.params.id;
   
    // const hostId = req.user.id; // From JWT
    const result = await EventService.jointEvents(userId, eventId);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "You're Joint Events successfully",
      data: result,
    });
})


export const EventController = {
    createEvent,
    allEvent,
    joinEvent
}