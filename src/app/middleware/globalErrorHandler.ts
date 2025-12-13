import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let success = false;
  let message = err.message || "Something went wrong!";
  let error = err;

  /**
   * ✅ Prisma Known Errors
   */
  if (err?.name === "PrismaClientKnownRequestError") {
    switch (err.code) {
      case "P2002":
        statusCode = httpStatus.CONFLICT;
        message = "Duplicate key error";
        error = err.meta;
        break;

      case "P2003":
        statusCode = httpStatus.BAD_REQUEST;
        message = "Foreign key constraint failed";
        error = err.meta;
        break;

      case "P1000":
        statusCode = httpStatus.BAD_REQUEST;
        message = "Authentication failed against database server";
        error = err.meta;
        break;

      default:
        statusCode = httpStatus.BAD_REQUEST;
        message = "Database request error";
        error = err.meta;
    }
  }

  /**
   * ✅ Prisma Validation Error
   */
  else if (err?.name === "PrismaClientValidationError") {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Prisma validation error";
    error = err.message;
  }

  /**
   * ✅ Prisma Initialization Error
   */
  else if (err?.name === "PrismaClientInitializationError") {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Prisma initialization failed";
    error = err.message;
  }

  /**
   * ✅ Prisma Unknown Error
   */
  else if (err?.name === "PrismaClientUnknownRequestError") {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Unknown Prisma error occurred";
    error = err.message;
  }

  res.status(statusCode).json({
    success,
    message,
    error,
  });
};

export default globalErrorHandler;
