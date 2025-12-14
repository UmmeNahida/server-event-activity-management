import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { sendResponse } from "../../utils/sendResponse";
import { HostService } from "./host.service";

const createEvent = catchAsync(async(req:Request & JwtPayload,res:Response, next:NextFunction)=>{
   
   const hostId = req.user.id; // From JWT
    const payload = req.body;
    const file = req.file;
    console.log("req user", req.user)

    const result = await HostService.createEvent(hostId, payload,file);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Event created successfully",
      data: result,
    });
})


const getEventAnalytics = catchAsync(async (req:Request & JwtPayload, res:Response,NextFunction) => {
  const user = req.user;

  const data = await HostService.getEventAnalytics(user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Analytics fetched successfully",
    data,
  });
});

const updateEvent = catchAsync(async(req:Request & JwtPayload,res:Response, next:NextFunction)=>{
   
    const userInfo = req.user; // From JWT
    const userPayload = req.body;
    const eventId = req.params.id
    
    // const hostId = req.user.id; // From JWT
    const result = await HostService.updateEvent(eventId,userInfo,userPayload);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Event has been updated successfully",
      data: result,
    });
})


const paymentOverview = catchAsync(async(req:Request & JwtPayload,res:Response, next:NextFunction)=>{
   
    const hostId = req.user.id; 
    
    // const hostId = req.user.id; // From JWT
    const result = await HostService.paymentOverview(hostId);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Host payment overview retrieve successfully",
      data: result,
    });
})


export const HostController = {
    getEventAnalytics,
    createEvent,
    updateEvent,
    paymentOverview
}
