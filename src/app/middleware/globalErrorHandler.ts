import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express"
import httpStatus from "http-status"

const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    
    let statusCode:number = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    let success = false;
    let message = err.message || "Something went wrong!";
    let error = err;

    if(err.name === "PrismaClientKnownRequestError"){
        if(err.code === 'P2002'){
           message = "Dublicate key error",
            error = err.meta,
            statusCode = httpStatus.CONFLICT
        }
        if(err.code === "P1000"){
            message = "Authentication failed against database server",
            error = err.meta,
            statusCode = httpStatus.BAD_REQUEST
        }
        if(err.code === "P2003"){
            message = "Foreign key constraint failed",
            error = err.meta,
            statusCode = httpStatus.BAD_REQUEST
        }
    }

   else if(err instanceof Prisma.PrismaClientValidationError){
        message = "validation Err",
        error = err.message,
        statusCode = httpStatus.BAD_REQUEST
    }

   else if(err instanceof Prisma.PrismaClientUnknownRequestError){
       message = "Unknown Prisma error occured!",
       error = err.message,
       statusCode = httpStatus.BAD_REQUEST
   }

   else if(err instanceof Prisma.PrismaClientInitializationError){
       message = "Prisma client Failed to initialize!",
       error = err.message,
       statusCode = httpStatus.BAD_REQUEST
   }

    // console.log("error------", err)

    res.status(statusCode).json({
        success,
        message,
        error
    })
};

export default globalErrorHandler;