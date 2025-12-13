import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import { EventService } from "./event.service"
import { JwtPayload } from "jsonwebtoken"


const updateEventStatus = catchAsync(async (req:Request & JwtPayload, res:Response, next:NextFunction) => {
  const { id } = req.params;
  const { status } = req.body;   // OPEN | CANCELLED | COMPLETED

  const data = await EventService.updateEventStatus(req.user, id, status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event status updated successfully",
    data,
  });
});



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


const myEvents = catchAsync(async(req:Request & JwtPayload,res:Response, next:NextFunction)=>{
   
    const userInfo = req.user; // From JWT
    
    // const hostId = req.user.id; // From JWT
    const result = await EventService.getMyEvents(userInfo);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "My Events Retrieve successfully",
      data: result,
    });
})

const getMyReview = catchAsync(async(req:Request & JwtPayload,res:Response, next:NextFunction)=>{
   
    const userInfo = req.user; // From JWT
    
    // const hostId = req.user.id; // From JWT
    const result = await EventService.getMyEvents(userInfo);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "My Review Retrieve successfully",
      data: result,
    });
})



const getUpcomingEvents = catchAsync(async (req:Request & JwtPayload, res:Response, next:NextFunction) => {
  const user = req.user;

  const data = await EventService.getUpcomingEvents(user);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Upcoming events fetched successfully",
    data:data,
  });
});

const getEventHistory = catchAsync(async (req:Request & JwtPayload, res:Response, next:NextFunction) => {
  const user = req.user;

  const data = await EventService.getEventHistory(user);
  console.log("hisorydata:", data)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Past events fetched successfully",
    data: data,
  });
});


const singleEvent = catchAsync(async (req: Request, res: Response,next:NextFunction) => {
    const { id } = req.params;
    const result = await EventService.singleEvent(id);
    console.log("result", result)
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Single Event retrieval successfully',
        data: result,
    });
});


export const EventController = {
    
    allEvent,
    myEvents,
    getMyReview,
    getUpcomingEvents,
    getEventHistory,
    singleEvent,
    updateEventStatus
}