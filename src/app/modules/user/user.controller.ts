import { NextFunction, Request, Response } from "express"
import httpStatus from "http-status"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import { UserService } from "./user.service";
import { JwtPayload } from "jsonwebtoken";


    interface IPayloadUser {
      user?: {
        id: string;
        role: string;
        email: string;
      };
    }

const getMyProfile =  catchAsync(async (req: Request & IPayloadUser, res: Response, next:NextFunction) => {
    console.log("req:", req.user)
    const userId = req.user!.id;
    const role = req.user!.role;

    const data = await UserService.getMyProfile(userId, role);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Profile fetched successfully",
      data: data
    });
  })

const updateMyProfile =  catchAsync(async (req: Request & IPayloadUser, res: Response, next:NextFunction) => {
    
    const userId = req.user!.id;
    const updateInfo = req.body;

    const data = await UserService.updateMyProfile(userId, updateInfo);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Profile fetched successfully",
      data: data
    });
  })

const deleteMyAccount =  catchAsync(async (req: Request & IPayloadUser, res: Response, next:NextFunction) => {
    
    const userId = req.user!.id;

    const data = await UserService.deleteMyAccount(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Profile have been deleted successfully",
      data: data
    });
  })


const createReport =  catchAsync(async (req: Request & JwtPayload, res: Response, next:NextFunction) => {
    
    const userId = req.user.id;

    const data = await UserService.createReport(userId,req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Report has been creted successfully",
      data: data
    });
  })



export const UserController = {
   getMyProfile,
   updateMyProfile,
   deleteMyAccount,
   createReport
}