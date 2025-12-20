import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { ParticipantService } from "./participant.service";
import { pick } from "@/app/helper/pick";
import { IPayloadUser } from "@/app/types/userType";
import httpStatus from "http-status";

const joinEvent = catchAsync(
  async (
    req: Request & JwtPayload,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.user.id;
    const eventId = req.params.id;

    console.log(req.query);

    // const hostId = req.user.id; // From JWT
    const result = await ParticipantService.jointEvents(
      userId,
      eventId
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "You're Joint Events successfully",
      data: result,
    });
  }
);

const addReview = catchAsync(
  async (
    req: Request & JwtPayload,
    res: Response,
    next: NextFunction
  ) => {
    const user = req.user;
    const payload = req.body;

    const data = await ParticipantService.addReview(user, payload);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Review added successfully!",
      data,
    });
  }
);

const getJoinedEvents = catchAsync(
  async (
    req: Request & IPayloadUser,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.user!.id;
    const filter = pick(req.query, [
      "search",
      "date",
      "location",
      "type",
      "fee",
    ]);

    const options = pick(req.query, [
      "page",
      "limit",
      "sortBy",
      "sortOrder",
    ]);

    const result = await ParticipantService.getJoinedEvents(
      userId,
      filter,
      options
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "All Joined events retrieve successfully",
      data: result,
    });
  }
);

const getUserJoinedPastEvents = catchAsync(
  async (
    req: Request & JwtPayload,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.user.id;
    const filter = req.query;
    const options = pick(req.query, [
      "page",
      "limit",
      "sortBy",
      "sortOrder",
    ]);

    const data = await ParticipantService.getUserJoinedPastEvents(
      userId,
      filter,
      options
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Get My Past Events successfully",
      data,
    });
  }
);

export const ParticipantController = {
  joinEvent,
  addReview,
  getJoinedEvents,
  getUserJoinedPastEvents,
};
