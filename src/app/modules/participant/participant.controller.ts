import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { ParticipantService } from "./participant.service";


const joinEvent = catchAsync(async(req:Request & JwtPayload,res:Response, next:NextFunction)=>{

   const userId = req.user.id; // From JWT
   const eventId = req.params.id;
   
    // const hostId = req.user.id; // From JWT
    const result = await ParticipantService.jointEvents(userId, eventId);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "You're Joint Events successfully",
      data: result,
    });
})

const addReview = catchAsync(async (req:Request & JwtPayload, res:Response, next:NextFunction) => {
  const user = req.user;
  const payload = req.body;

  const data = await ParticipantService.addReview(user, payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Review added successfully!",
    data,
  });
});



export const ParticipantController = {
    joinEvent,
    addReview
}