import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationError } from "express-validator";
import { ApiError } from "../error/errorHandler";

export const validate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("Validation errors:", errors.array());
    console.log("Request body:", req.body);

    const formattedErrors = errors
      .array()
      .reduce((acc: any, error: ValidationError) => {
        if ("path" in error) {
          acc[error.path] = error.msg;
        }
        return acc;
      }, {});

    throw new ApiError(
      "Validation failed",
      422,
      "VALIDATION_ERROR",
      formattedErrors
    );
  }

  next();
};

export const validateRequest = (schema: any) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.parse) {
        // Zod schema
        const data = {
          ...req.params,
          ...req.query,
          ...req.body,
        };
        schema.parse(data);
      }
      next();
    } catch (error: any) {
      throw new ApiError(
        "Validation failed",
        422,
        "VALIDATION_ERROR",
        error.errors || error.message
      );
    }
  };
};
