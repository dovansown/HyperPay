import type { NextFunction, Request, Response } from "express";
import { AppError, ErrorCodes } from "../http/app-error.js";
import type { ErrorResponse } from "../http/api-response.js";
import { logger } from "../utils/logger.js";

export function errorHandlerMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof AppError) {
    const payload: ErrorResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      },
      requestId: res.locals.requestId
    };
    res.status(error.statusCode).json(payload);
    return;
  }

  logger.error({ error }, "Unhandled error");
  const payload: ErrorResponse = {
    success: false,
    error: {
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: "Internal server error"
    },
    requestId: res.locals.requestId
  };
  res.status(500).json(payload);
}
