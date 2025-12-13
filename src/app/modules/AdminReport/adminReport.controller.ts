import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AdminReportService } from "./adminReport.service";

export const AdminReportController = {
  getAllReports: catchAsync(async (req:Request, res:Response) => {
    const data = await AdminReportService.getAllReports(req.query);
    sendResponse(res, {
        success: true, 
        statusCode: 200,
         message:"Get all reports successfully",
         data:data,  });
  }),

  getSingleReport: catchAsync(async (req, res) => {
    const data = await AdminReportService.getSingleReport(req.params.id);
    sendResponse(res, {success: true, statusCode: 200, message:"get single report successfully", data: data });
  }),

  takeAction: catchAsync(async (req, res) => {
    const result = await AdminReportService.takeAction(req.params.id, req.body);
    sendResponse(res, { success: true, statusCode: 200,message:"Action has been taken for the report", data: result });
  }),
};
