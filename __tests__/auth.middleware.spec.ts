import pkg from "jsonwebtoken";
import { authMiddleware } from "../src/middleware/auth.middleware.ts";

jest.mock("../src/authentication/users.model.ts", () => ({
  UserModel: {
    findById: jest.fn(),
  },
}));

describe("authMiddleware", () => {
  const { UserModel } = jest.requireMock(
    "../src/authentication/users.model.ts"
  );

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  it("calls next with user when token valid", async () => {
    jest
      .spyOn(pkg, "verify")
      .mockImplementation(
        (token: any, _s: any) => ({ userId: "mongoId" } as any)
      );
    (UserModel.findById as jest.Mock).mockResolvedValue({
      _id: "mongoId",
      userId: "u1",
    });

    const req: any = {
      headers: { authorization: "Bearer valid" },
      cookies: {},
    };
    const res: any = {};
    const next = jest.fn();

    await authMiddleware(req, res, next);
    expect(req.user).toEqual({ _id: "mongoId", userId: "u1" });
    expect(next).toHaveBeenCalledWith();
  });

  it("errors when token missing", async () => {
    const req: any = { headers: {}, cookies: {} };
    const res: any = {};
    const next = jest.fn();

    await authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
