import { NextFunction, Request, Response } from "express"
import httpStatus from "http-status-codes"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import { AuthService } from "./auth.service"

const createUser = catchAsync(async(req:Request,res:Response, next:NextFunction)=>{
     
    const userData = req.body
    const file = req.file;
     const result = await AuthService.registerUser(userData, file);
   
        sendResponse(res,{
            success: true,
            statusCode: httpStatus.CREATED,
            message: "user created successfully",
            data: result
        })
})


export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
     const result = await AuthService.loginUser(req.body);
     const { accessToken, refreshToken} = result;

    res.cookie("accessToken", accessToken, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60
    })
    res.cookie("refreshToken", refreshToken, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 90
    })

      sendResponse(res,{
            success: true,
            statusCode: httpStatus.OK,
            message: "User Logged in successfully",
            data: result
        })
   
})

export const AuthController = {
    createUser,
    login
}