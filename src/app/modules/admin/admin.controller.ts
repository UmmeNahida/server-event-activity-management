import { NextFunction, Request, Response } from "express"
import httpStatus from "http-status"
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AdminService } from "./admin.service";

const getAllEvents = catchAsync(async(req:Request,res:Response, next:NextFunction)=>{
     
    const filter = req.query;
     const result = await AdminService.getAllEvents(filter);
   
        sendResponse(res,{
            success: true,
            statusCode: httpStatus.CREATED,
            message: "user created successfully",
            data: result
        })
})

  // USERS
 const getAllUsers = catchAsync(async (req, res) => {
    const result = await AdminService.getAllUsers(req.query);
       sendResponse(res,{
            success: true,
            statusCode: httpStatus.OK,
            message: "aLL user retrieve successfully",
            data: result
        })
  })

 const getUserById = catchAsync(async (req, res) => {
    const result = await AdminService.getUserById(req.params.id);
       sendResponse(res,{
            success: true,
            statusCode: httpStatus.OK,
            message: "Sing user info retrieve successfully",
            data: result
        })
  })

 const updateUserStatus= catchAsync(async (req, res) => {
    const result = await AdminService.updateUserStatus(req.params.id, req.body.status);
       sendResponse(res,{
            success: true,
            statusCode: httpStatus.OK,
            message: "user status updated successfully",
            data: result
        })
  })

 const deleteUser= catchAsync(async (req, res) => {
    const result = await AdminService.deleteUser(req.params.id);
       sendResponse(res,{
            success: true,
            statusCode: httpStatus.OK,
            message: "user deleted successfully",
            data: result
        });
  })

const promoteToHost= catchAsync(async (req, res) => {
    const result = await AdminService.promoteToHost(req.params.id);
       sendResponse(res,{
            success: true,
            statusCode: httpStatus.OK,
            message: "Promote to Host successfully",
            data: result
        });
  })

const demoteToUser = catchAsync(async (req, res) => {
    const result = await AdminService.demoteToUser(req.params.id);
       sendResponse(res,{
            success: true,
            statusCode: httpStatus.OK,
            message: "Host is Promote to User successfully",
            data: result
        });
  })

  // HOSTS
const  getAllHosts = catchAsync(async (req, res) => {
    const result = await AdminService.getAllHosts(req.query);
       sendResponse(res,{
            success: true,
            statusCode: httpStatus.OK,
            message: "All Host Retrieve successfully",
            data: result
        });
  })

 const getHostById= catchAsync(async (req, res) => {
    const result = await AdminService.getHostById(req.params.id);
       sendResponse(res,{
            success: true,
            statusCode: httpStatus.OK,
            message: "Host Details retrieve successfully",
            data: result
        });
  })

 const updateHostStatus= catchAsync(async (req, res) => {
    const result = await AdminService.updateHostStatus(req.params.id, req.body.status);
      sendResponse(res,{
            success: true,
            statusCode: httpStatus.OK,
            message: "Update host successfully",
            data: result
        });
  })

 const deleteHost = catchAsync(async (req:Request, res) => {
    const result = await AdminService.deleteHost(req.params.id);
      sendResponse(res,{
            success: true,
            statusCode: httpStatus.CREATED,
            message: "user created successfully",
            data: result
        });
  })


export const AdminController = {
  getAllEvents,
  getAllHosts,
  getAllUsers,
  getHostById,
  getUserById,
  updateUserStatus,
  updateHostStatus,
  deleteHost,
  deleteUser,
  promoteToHost,
  demoteToUser
}




