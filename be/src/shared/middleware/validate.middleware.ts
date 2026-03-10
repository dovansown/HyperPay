import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { AppError, ErrorCodes } from "../http/app-error.js";

interface ValidationShape {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

export function validate(schema: ValidationShape) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const errors: Array<{ path: string; message: string }> = [];

    if (schema.body) {
      const parsed = schema.body.safeParse(req.body);
      if (!parsed.success) {
        errors.push(
          ...parsed.error.issues.map((issue) => ({
            path: `body.${issue.path.join(".")}`,
            message: issue.message
          }))
        );
      } else {
        req.body = parsed.data;
      }
    }

    if (schema.params) {
      const parsed = schema.params.safeParse(req.params);
      if (!parsed.success) {
        errors.push(
          ...parsed.error.issues.map((issue) => ({
            path: `params.${issue.path.join(".")}`,
            message: issue.message
          }))
        );
      } else {
        req.params = parsed.data;
      }
    }

    if (schema.query) {
      const parsed = schema.query.safeParse(req.query);
      if (!parsed.success) {
        errors.push(
          ...parsed.error.issues.map((issue) => ({
            path: `query.${issue.path.join(".")}`,
            message: issue.message
          }))
        );
      } else {
        req.query = parsed.data;
      }
    }

    if (errors.length > 0) {
      next(new AppError(400, ErrorCodes.INVALID_REQUEST, "Validation failed", errors));
      return;
    }

    next();
  };
}
