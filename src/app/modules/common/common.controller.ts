import { NextFunction, Request, Response } from "express"
import httpStatus from "http-status"
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { CommonService } from "./common.service";
import { pick } from "../../helper/pick";
import { eventFilterableField } from "./event.constant";

// const getAllEvents = catchAsync(async(req:Request,res:Response, next:NextFunction)=>{
//      const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
//     const filter = req.query;
//      const result = await CommonService.getAllEvents(filter);
   
//         sendResponse(res,{
//             success: true,
//             statusCode: httpStatus.CREATED,
//             message: "All Events Retrieve successfully",
//             data: result
//         })
// })

const getAllEvents = catchAsync(async(req:Request,res:Response, next:NextFunction)=>{
     const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
     const fillters = pick(req.query, eventFilterableField)

     const result = await CommonService.getAllEvents(fillters,options);
   
        sendResponse(res,{
            success: true,
            statusCode: httpStatus.CREATED,
            message: "All Events Retrieve successfully",
            data: result
        })
})

const getTopRatedEvents = catchAsync(async(req:Request,res:Response, next:NextFunction)=>{
   

     const result = await CommonService.getTopRatedEvents();
   
        sendResponse(res,{
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Top rated Events Retrieve successfully",
            data: result
        })
})

const getPopularEvents = catchAsync(async(req:Request,res:Response, next:NextFunction)=>{
   

     const result = await CommonService.getPopularEvents();
   
        sendResponse(res,{
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Top Popular Events Retrieve successfully",
            data: result
        })
})

export const CommonController = {
  getAllEvents,
  getTopRatedEvents,
  getPopularEvents
}