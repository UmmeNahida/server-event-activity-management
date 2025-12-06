// import { ZodObject } from "zod";
import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";

export  const validationSchema = (schema: ZodObject)=> (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body || req.body.data);

    if (!result.success){
        return res.status(400).json({
            message: "Validation failed",
            errors: result.error.flatten(),
        });
    }

    req.body = result.data;
    next()
  }
