import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { isDevEnv } from "../utils/env";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Stack traces only on an explicit dev box — never when NODE_ENV is unset.
  const isDev = isDevEnv();
  
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      // A stable code the apps branch on (e.g. TOPUP_REQUIRED), when the error has one.
      ...(typeof (err as any).code === "string" ? { code: (err as any).code } : {}),
      ...(err.statusCode === 400 && (err as any).errors ? { errors: (err as any).errors } : {}),
      stack: isDev ? err.stack : undefined,
    });
  }

  // Mongoose Duplicate Key Error (e.g. unique field constraint violation)
  if (err.name === "MongoServerError" && err.code === 11000) {
    const key = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({
      success: false,
      message: `A record with this ${key} already exists.`,
    });
  }

  // Upload limits (upload.middleware): a file over 5MB, too many files, an unexpected field.
  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.code === "LIMIT_FILE_SIZE" ? "Each image must be 5MB or smaller." : err.message,
    });
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors || {}).map((el: any) => el.message);
    return res.status(400).json({
      success: false,
      message: "Database Validation Failed",
      errors,
    });
  }

  // Default server error
  console.error("Unhandled Application Error:", err);
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    stack: isDev ? err.stack : undefined,
  });
};
