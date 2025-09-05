import { AuthenticationService } from "../src/authentication/authentication.service.ts";
import { type User } from "../src/authentication/users.interface.ts";

jest.mock("../src/authentication/users.model.ts", () => ({
  UserModel: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock("../src/routes/shopping-cart/shopping-cart.model.ts", () => ({
  ShoppingCartModel: {
    create: jest.fn(),
  },
}));

describe("AuthenticationService", () => {
  const { UserModel } = jest.requireMock(
    "../src/authentication/users.model.ts"
  );
  const { ShoppingCartModel } = jest.requireMock(
    "../src/routes/shopping-cart/shopping-cart.model.ts"
  );

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  it("createToken returns token and expiresIn", () => {
    const service = new AuthenticationService();
    const tokenData = service.createToken({
      _id: "mongoId",
      userId: "u1",
      email: "e",
      password: "p",
    } as unknown as User);
    expect(tokenData.token).toBeDefined();
    expect(tokenData.expiresIn).toBe(service.expiresIn);
  });

  it("createUser creates a user and an empty cart", async () => {
    const service = new AuthenticationService();
    (UserModel.create as jest.Mock).mockResolvedValue({
      _id: "mongoId",
      userId: "u1",
    });
    (ShoppingCartModel.create as jest.Mock).mockResolvedValue({});

    const user = await service.createUser({
      email: "e@e.com",
      password: "hashed",
    } as any);

    expect(UserModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "e@e.com",
        password: "hashed",
      })
    );
    expect(ShoppingCartModel.create).toHaveBeenCalledWith({ userId: "u1" });
    expect(user).toEqual({ _id: "mongoId", userId: "u1" });
  });

  it("findUserByEmail forwards to model", async () => {
    const service = new AuthenticationService();
    (UserModel.findOne as jest.Mock).mockResolvedValue({ _id: "1" });
    const found = await service.findUserByEmail("e@e.com");
    expect(UserModel.findOne).toHaveBeenCalledWith({ email: "e@e.com" });
    expect(found).toEqual({ _id: "1" });
  });
});
