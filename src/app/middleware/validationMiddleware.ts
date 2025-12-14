import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";

export const validationSchema = (schema: ZodObject) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let parsedData: any;
  console.log("req body data;",req.body)

  try {
    // Case 1: req.body.data exists → usually from multipart/form-data
    if (req.body?.data) {
      // If data is a string → try JSON.parse
      if(typeof req.body.data === "string") {
        parsedData = JSON.parse(req.body.data)
      } else {
        parsedData = req.body.data;
      }
    } else {
      // Case 2: Normal body (application/json)
      parsedData = req.body;
    }

    // Validate with Zod
    const result = schema.safeParse(parsedData);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.flatten(),
      });
    }

    // assign validated data back
    req.body = result.data;

    next();
  } catch (e: any) {
    return res.status(400).json({
      message: "Invalid JSON in req.body.data",
      error: e.message,
    });
  }
};
