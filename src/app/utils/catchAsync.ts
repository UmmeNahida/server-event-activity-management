import { NextFunction, Request, Response } from "express"
import { envVars } from "../config/env"


type typeAsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>


export const catchAsync = (fn: typeAsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {

          
        if (envVars.NODE_ENV === "development") {
            console.log("catch-err", err)
            
        }
        next(err)
    })
}