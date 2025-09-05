import type { NextFunction, Request, Response } from "express";

export const corsMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
): void => {
  // Allow your frontend domain
  const allowedOrigins = [
    "http://localhost:4200", // Angular default
  ];

  const origin = request.headers.origin;

  // For development, allow any localhost origin
  if (process.env.NODE_ENV === "development" && origin?.includes("localhost")) {
    response.header("Access-Control-Allow-Origin", origin);
  } else if (allowedOrigins.includes(origin as string)) {
    response.header("Access-Control-Allow-Origin", origin);
  }

  response.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-secret"
  );
  response.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  response.header("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    response.sendStatus(200);
  } else {
    next();
  }
};
