import type { Response } from "express";
import type { SuccessResponse } from "./api-response.js";

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: Record<string, unknown>
) {
  const payload: SuccessResponse<T> = {
    success: true,
    data,
    requestId: res.locals.requestId
  };
  if (meta) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
}
