import * as bcrypt from "bcrypt";
import express from "express";
import request from "supertest";

import { AuthenticationController } from "../src/authentication/authentication.controller.ts";
import { AuthenticationService } from "../src/authentication/authentication.service.ts";

jest.mock("../src/authentication/authentication.service.ts");

describe("AuthenticationController", () => {
  const app = express();
  app.use(express.json());

  let controller: AuthenticationController;
  let mockService: jest.Mocked<AuthenticationService>;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.JWT_SECRET = "test-secret";
    controller = new AuthenticationController();
    mockService =
      new (AuthenticationService as unknown as jest.Mock<AuthenticationService>)() as jest.Mocked<AuthenticationService>;
    // replace service instance on controller
    (controller as any).authenticationService = mockService;
    app.use("/", controller.router);
  });

  it("register creates user and sets cookie", async () => {
    jest.spyOn(bcrypt, "genSalt").mockResolvedValue("salt" as any);
    jest.spyOn(bcrypt, "hash").mockResolvedValue("hashed" as any);
    mockService.createUser.mockResolvedValue({ _id: "1", userId: "u1" } as any);
    mockService.createToken.mockReturnValue({ token: "t", expiresIn: "30d" });
    mockService.createCookie.mockReturnValue(
      "Authorization=t; HttpOnly; Max-Age=30d"
    );

    const res = await request(app)
      .post("/auth/register")
      .send({ email: "e@e.com", password: "P4ssword!" });

    expect(mockService.createUser).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.body).toEqual({ token: "t", expiresIn: "30d" });
  });

  it("login returns token when credentials valid", async () => {
    jest.spyOn(bcrypt, "compare").mockResolvedValue(true as any);
    mockService.findUserByEmail.mockResolvedValue({
      _id: "1",
      password: "hashed",
    } as any);
    mockService.createToken.mockReturnValue({ token: "t", expiresIn: "30d" });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "e@e.com", password: "secret" });

    expect(mockService.findUserByEmail).toHaveBeenCalledWith("e@e.com");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ token: "t", expiresIn: "30d" });
  });
});
