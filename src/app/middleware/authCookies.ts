import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { envVars } from "../config/env";
import { verifyToken } from "../helper/jwtToken";
import AppError from "../config/customizer/AppError";

const authCookies = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      // console.log("roles---",...roles)
      const token =
        req.cookies.accessToken ||
        req.headers.authorization?.split(" ")[1];

      if (!token) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "you don't have a token!"
        );
      }

      const verifyUser = verifyToken(
        token,
        envVars.JWT_SECRET as string
      );

      req.user = verifyUser;

      // console.log("cokieUser:", verifyUser.role)

      if (!roles.includes(verifyUser.role)) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "You are not authorized!"
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default authCookies;
