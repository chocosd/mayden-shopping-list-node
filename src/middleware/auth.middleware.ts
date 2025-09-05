import type { NextFunction, Response } from "express";
import pkg from "jsonwebtoken";
import { UserModel } from "../authentication/users.model.ts";
import { MissingAuthToken } from "../exceptions/missing-auth-token.exception.ts";
import { WrongAuthToken } from "../exceptions/wrong-auth-token.exception.ts";
import type {
  RequestWithUser,
  TokenData,
} from "../shared/interfaces/request-with-user.interface.ts";
const { verify } = pkg;

export async function authMiddleware(
  request: RequestWithUser,
  response: Response,
  next: NextFunction
): Promise<void> {
  if (request.method === "OPTIONS") {
    response.sendStatus(204);
    return;
  }

  const secret = process.env.JWT_SECRET as string;

  let token = null;

  if (request.headers.authorization) {
    const authHeader = request.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).replace(/"/g, "");
    }
  } else if (request.cookies && request.cookies.Authorization) {
    token = request.cookies.Authorization;
  }

  if (!token) {
    return next(new MissingAuthToken());
  }

  try {
    const decoded = pkg.verify(token, secret) as TokenData | undefined;
    const userId = decoded?.userId;

    const foundUser = await UserModel.findById(userId);

    if (!foundUser) {
      return next(new WrongAuthToken());
    }

    request.user = foundUser;
    next();
  } catch (error) {
    console.log(error);
    next(new WrongAuthToken());
  }
}
