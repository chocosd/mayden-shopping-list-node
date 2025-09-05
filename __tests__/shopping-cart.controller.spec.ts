import { ShoppingCartController } from "../src/routes/shopping-cart/shopping-cart.controller.ts";

describe("ShoppingCartController", () => {
  it("getShoppingItems returns cart from service", async () => {
    const controller = new ShoppingCartController();
    (controller as any).service = {
      getCart: jest.fn().mockResolvedValue({
        items: [],
        total: 0,
        spendLimit: 0,
        userId: "u1",
      }),
    };
    const req: any = { user: { userId: "u1" } };
    const res: any = { json: jest.fn() };
    await (controller as any).getShoppingItems(req, res);
    expect(res.json).toHaveBeenCalledWith({
      items: [],
      total: 0,
      spendLimit: 0,
      userId: "u1",
    });
  });

  it("addShoppingItems calls service and sets 201", async () => {
    const controller = new ShoppingCartController();
    (controller as any).service = {
      addItems: jest
        .fn()
        .mockResolvedValue({ items: [{ id: "1" }], userId: "u1" }),
    };
    const req: any = { user: { userId: "u1" }, body: [{ id: "1" }] };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await (controller as any).addShoppingItems(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      items: [{ id: "1" }],
      userId: "u1",
    });
  });
});
