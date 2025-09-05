import { Response } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { RequestWithUser } from "../../shared/interfaces/request-with-user.interface";
import { ControllerImpl } from "../../shared/util/controller-impl.abstract";
import { InitialiseRoutes } from "../../shared/util/route-initialisation.decorator";
import type { ShoppingItem } from "./shopping-cart.interface";
import { ShoppingCartService } from "./shopping-cart.service";

@InitialiseRoutes()
export class ShoppingCartController extends ControllerImpl {
  public path = "/shopping-items";
  private service = new ShoppingCartService();

  public initialiseRoutes(): void {
    this.router.get(`${this.path}`, authMiddleware, this.getShoppingItems);
    this.router.post(`${this.path}`, authMiddleware, this.addShoppingItems);
    this.router.post(
      `${this.path}/reorder`,
      authMiddleware,
      this.reorderShoppingItems
    );
    this.router.patch(
      `${this.path}/:id`,
      authMiddleware,
      this.updateShoppingItem
    );
    this.router.put(`${this.path}`, authMiddleware, this.updateShoppingItems);
    this.router.delete(
      `${this.path}/:id`,
      authMiddleware,
      this.removeShoppingItem
    );
    this.router.delete(
      `${this.path}/:ids`,
      authMiddleware,
      this.removeShoppingItems
    );
  }

  public getShoppingItems = async (
    req: RequestWithUser,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.userId;
    const cart = await this.service.getCart(userId);
    res.json(cart);
  };

  public addShoppingItems = async (
    req: RequestWithUser,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.userId;

    if (Array.isArray(req.body)) {
      const cart = await this.service.addItems(userId, req.body);
      res.status(201).json(cart);
      return;
    }

    const cart = await this.service.addItem(userId, req.body as ShoppingItem);
    res.status(201).json(cart);
  };

  public updateShoppingItem = async (
    req: RequestWithUser,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };
    const cart = await this.service.updateItem(userId, id, req.body);
    res.json(cart);
  };

  public updateShoppingItems = async (
    req: RequestWithUser,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.userId;
    const cart = await this.service.updateItems(
      userId,
      req.body as ShoppingItem[]
    );
    res.json(cart);
  };

  public reorderShoppingItems = async (
    req: RequestWithUser,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.userId;
    const cart = await this.service.reorderItems(
      userId,
      req.body as ShoppingItem[]
    );
    res.json(cart);
  };

  public removeShoppingItem = async (
    req: RequestWithUser,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };
    const cart = await this.service.removeItem(userId, id);
    res.json(cart);
  };

  public removeShoppingItems = async (
    req: RequestWithUser,
    res: Response
  ): Promise<void> => {
    const userId = req.user!.userId;
    const idsParam = (req.params as { ids: string }).ids;
    const ids = idsParam.split(",");
    const cart = await this.service.removeItems(userId, ids);
    res.json(cart);
  };
}
