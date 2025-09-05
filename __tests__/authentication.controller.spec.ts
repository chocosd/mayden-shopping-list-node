import * as bcrypt from "bcrypt";
import express from "express";
import request from "supertest";

import { AuthenticationController } from "../src/authentication/authentication.controller.ts";
import { AuthenticationService } from "../src/authentication/authentication.service.ts";
jest.mock("bcrypt", () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe("AuthenticationController", () => {
  let app: express.Express;

  let controller: AuthenticationController;
  let mockService: jest.Mocked<AuthenticationService>;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.JWT_SECRET = "test-secret";
    app = express();
    app.use(express.json());
    controller = new AuthenticationController();
    // Manually mock the AuthenticationService methods used by controller
    mockService = {
      createUser: jest.fn(),
      createToken: jest.fn(),
      createCookie: jest.fn(),
      findUserByEmail: jest.fn(),
      expiresIn: "30d",
      user: undefined as any,
    } as unknown as jest.Mocked<AuthenticationService>;
    (controller as any).authenticationService = mockService;
    app.use("/", controller.router);
  });

  it("register creates user and sets cookie", async () => {
    (bcrypt.genSalt as unknown as jest.Mock).mockResolvedValueOnce(
      "salt" as any
    );
    (bcrypt.hash as unknown as jest.Mock).mockResolvedValueOnce(
      "hashed" as any
    );
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
    (bcrypt.compare as unknown as jest.Mock).mockResolvedValueOnce(true);
    (mockService.findUserByEmail as jest.Mock).mockResolvedValue({
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
