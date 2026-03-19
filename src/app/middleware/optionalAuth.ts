import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import { verifyToken } from "../helper/jwtToken";

// Attaches req.user if a valid token is present, but never blocks the request
const optionalAuth = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction,
) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.split(" ")[1];

    if (token) {
      req.user = verifyToken(token, envVars.JWT_SECRET as string);
    }
  } catch {
    // invalid/expired token — just ignore, treat as unauthenticated
  }
  next();
};

export default optionalAuth;
