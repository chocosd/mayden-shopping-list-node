import { ShoppingCartService } from "../src/routes/shopping-cart/shopping-cart.service.ts";

jest.mock("../src/routes/shopping-cart/shopping-cart.model.ts", () => ({
  ShoppingCartModel: {
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}));

describe("ShoppingCartService", () => {
  const { ShoppingCartModel } = jest.requireMock(
    "../src/routes/shopping-cart/shopping-cart.model.ts"
  );

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("getCart", () => {
    it("getCart creates a cart if not exists", async () => {
      const service = new ShoppingCartService();
      (ShoppingCartModel.findOne as jest.Mock).mockResolvedValue(null);
      (ShoppingCartModel.create as jest.Mock).mockResolvedValue({
        toJSON: () => ({
          items: [],
          total: 0,
          spendLimit: 0,
          title: "My Shopping List",
          userId: "u1",
        }),
      });

      const cart = await service.getCart("u1");
      expect(ShoppingCartModel.create).toHaveBeenCalledWith({ userId: "u1" });
      expect(cart).toEqual({
        items: [],
        total: 0,
        spendLimit: 0,
        title: "My Shopping List",
        userId: "u1",
      });
    });
  });

  describe("addItem", () => {
    it("addItem pushes item and returns updated cart", async () => {
      const service = new ShoppingCartService();

      // First findOne to compute next order
      (ShoppingCartModel.findOne as jest.Mock).mockResolvedValueOnce({
        items: [],
      });
      // recomputeAndReturn: findOne -> returns a doc-like with toJSON
      (ShoppingCartModel.findOne as jest.Mock).mockResolvedValueOnce({
        toJSON: () => ({
          items: [{ id: "1", price: 1, quantity: 1 }],
          total: 0,
          spendLimit: 0,
          title: "My Shopping List",
          userId: "u1",
        }),
      });
      (ShoppingCartModel.findOneAndUpdate as jest.Mock).mockResolvedValue({
        toJSON: () => ({
          items: [{ id: "1", price: 1, quantity: 1 }],
          total: 1,
          spendLimit: 0,
          title: "My Shopping List",
          userId: "u1",
        }),
      });
      (ShoppingCartModel.create as jest.Mock).mockResolvedValue({
        toJSON: () => ({
          items: [],
          total: 0,
          spendLimit: 0,
          title: "My Shopping List",
          userId: "u1",
        }),
      });

      const cart = await service.addItem("u1", {
        id: "1",
        name: "n",
        quantity: 1,
        price: 1,
        order: 0,
        bought: false,
      });

      expect(ShoppingCartModel.findOneAndUpdate).toHaveBeenCalled();
      expect(cart.userId).toBe("u1");
    });
  });
});
