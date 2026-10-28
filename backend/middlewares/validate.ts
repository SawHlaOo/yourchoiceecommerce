import { z, ZodError } from "zod";
import { RequestHandler } from "express";

const formatValidationError = (error: ZodError) =>
  error.issues.map((issue) => ({
    path: issue.path.length ? issue.path.join(".") : "root",
    message: issue.message,
  }));

export function validateBody(schema: z.ZodType): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: formatValidationError(result.error),
      });
    }

    req.body = result.data;
    return next();
  };
}

export function validateQuery(schema: z.ZodType): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: formatValidationError(result.error),
      });
    }

    req.query = result.data as any;
    return next();
  };
}

export function validateParams(schema: z.ZodType): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: formatValidationError(result.error),
      });
    }

    req.params = result.data as any;
    return next();
  };
}

