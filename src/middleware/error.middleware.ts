import type { NextFunction, Request, Response } from "express";
import { HttpException } from "../exceptions/http.exception.ts";

export function errorMiddleware(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction
): void {
  const err = error as Partial<HttpException> & { stack?: string };
  const status = err.status ?? err.errorStatus ?? 500;
  const message = err.message ?? err.errorMessage ?? "Something went wrong";

  response.status(status).json({ status, message });
}
