import * as bcrypt from "bcrypt";
import type { NextFunction, Request, Response } from "express";
import pkg from "jsonwebtoken";

import { HttpException } from "../exceptions/http.exception.ts";
import { MissingAuthToken } from "../exceptions/missing-auth-token.exception.ts";
import { WrongCredentials } from "../exceptions/wrong-credentials.exception.ts";
import type { RequestWithUser } from "../shared/interfaces/request-with-user.interface.ts";
import { ControllerImpl } from "../shared/util/controller-impl.abstract.ts";
import { InitialiseRoutes } from "../shared/util/route-initialisation.decorator.ts";
import { AuthenticationService } from "./authentication.service.ts";
import UsersDto from "./users.dto.ts";
import { UserModel } from "./users.model.ts";
const { sign, verify } = pkg;

@InitialiseRoutes()
export class AuthenticationController extends ControllerImpl {
  public expiresIn: string = "30d";
  public path: string = "/auth";
  public user = UserModel;
  public authenticationService = new AuthenticationService();

  public initialiseRoutes(): void {
    this.router.post(`${this.path}/register`, this.register);
    this.router.post(`${this.path}/login`, this.login);
    this.router.post(`${this.path}/refresh-token`, this.refreshToken);
  }

  public register = async (
    request: RequestWithUser,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto = Object.assign(new UsersDto(), request.body);

      const salt = await bcrypt.genSalt(10);
      dto.password = (await bcrypt.hash(
        dto.password,
        salt
      )) as unknown as string;

      const user = await this.authenticationService.createUser(dto);

      const tokenData = this.authenticationService.createToken(user);

      response.setHeader("Set-Cookie", [
        this.authenticationService.createCookie(tokenData),
      ]);
      response.send(tokenData);
    } catch (error) {
      console.log(error);
      next(new HttpException(400, `${error}`));
    }
  };

  public login = async (
    request: RequestWithUser,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = request.body as {
        email: string;
        password: string;
      };

      const user = await this.authenticationService.findUserByEmail(email);

      console.log("user", user);

      if (!user) {
        next(new WrongCredentials());
        return;
      }

      const isPasswordMatching = await bcrypt.compare(password, user.password);

      console.log("isPasswordMatching", isPasswordMatching);

      if (!isPasswordMatching) {
        next(new WrongCredentials());
        return;
      }

      const tokenData = this.authenticationService.createToken(user!);
      response.send(tokenData);
    } catch (error) {
      if (error instanceof HttpException) {
        next(error);
      } else {
        next(new HttpException(500, (error as Error).message));
      }
      return;
    }
  };

  public refreshToken = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = (request.headers as any)["authorization"] as
        | string
        | undefined;
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        next(new MissingAuthToken());
        return;
      }

      verify(
        token,
        process.env.JWT_SECRET as string,
        (
          err: pkg.VerifyErrors | null,
          user: string | pkg.JwtPayload | undefined
        ) => {
          if (err) {
            next(new MissingAuthToken());
            return;
          }

          const newToken = sign(
            user as string,
            process.env.JWT_SECRET as pkg.Secret,
            {
              expiresIn: this.expiresIn,
            } as pkg.SignOptions
          );

          response.send({
            expiresIn: this.expiresIn,
            newToken,
          });
        }
      );
    } catch (error) {
      next(new HttpException(500, (error as Error).message));
    }
  };
}
