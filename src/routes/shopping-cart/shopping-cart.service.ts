import { randomId } from "../../shared/util/random-id.ts";
import type { ShoppingCart, ShoppingItem } from "./shopping-cart.interface.ts";
import { ShoppingCartModel } from "./shopping-cart.model.ts";

export class ShoppingCartService {
  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private normalizeItems(items: ShoppingItem[]): ShoppingItem[] {
    return (items || []).map((item, index) => {
      const parsedOrder = Number(item.order);
      const safeOrder = Number.isFinite(parsedOrder) ? parsedOrder : index;
      return {
        ...item,
        id: item.id || randomId(12),
        order: safeOrder,
      } as ShoppingItem;
    });
  }

  private computeTotal(items: ShoppingItem[]): number {
    const sum = (items || []).reduce(
      (prev, item) =>
        prev + Number(item.price ?? 0) * Number(item.quantity ?? 0),
      0
    );
    return this.roundToTwoDecimals(sum);
  }

  private async recomputeAndReturn(userId: string): Promise<ShoppingCart> {
    const existing = await ShoppingCartModel.findOne({ userId });
    if (!existing) {
      const created = await ShoppingCartModel.create({ userId });
      return created.toJSON();
    }

    const current = existing.toJSON() as ShoppingCart;
    const normalized = this.normalizeItems(current.items || []);
    const total = this.computeTotal(normalized);

    const updated = await ShoppingCartModel.findOneAndUpdate(
      { userId },
      { $set: { items: normalized, total } },
      { new: true }
    );
    return updated!.toJSON();
  }

  public async getCart(userId: string): Promise<ShoppingCart> {
    return this.recomputeAndReturn(userId);
  }

  public async addItem(
    userId: string,
    item: Omit<ShoppingItem, "userId">
  ): Promise<ShoppingCart> {
    const current = await ShoppingCartModel.findOne({ userId });
    const nextOrder = current?.items?.length ?? 0;
    const withId = {
      ...item,
      id: item.id || randomId(12),
      order: item.order ?? nextOrder,
    } as ShoppingItem;
    await ShoppingCartModel.findOneAndUpdate(
      { userId },
      { $push: { items: { ...withId, userId } } },
      { new: true, upsert: true }
    );
    return this.recomputeAndReturn(userId);
  }

  public async addItems(
    userId: string,
    items: Omit<ShoppingItem, "userId">[]
  ): Promise<ShoppingCart> {
    const current = await ShoppingCartModel.findOne({ userId });
    let baseOrder = current?.items?.length ?? 0;

    const itemsWithUser = (items || []).map((item) => ({
      ...item,
      id: item.id || randomId(12),
      order: Number(item.order) ?? baseOrder++,
      userId,
    }));

    await ShoppingCartModel.findOneAndUpdate(
      { userId },
      { $push: { items: { $each: itemsWithUser } } },
      { new: true, upsert: true }
    );

    return this.recomputeAndReturn(userId);
  }

  public async updateItem(
    userId: string,
    id: string,
    updates: Partial<ShoppingItem>
  ): Promise<ShoppingCart> {
    await ShoppingCartModel.findOneAndUpdate(
      { userId, "items.id": id },
      {
        $set: Object.fromEntries(
          Object.entries(updates).map(([k, v]) => [`items.$.${k}`, v])
        ),
      },
      { new: true }
    );
    return this.recomputeAndReturn(userId);
  }

  public async updateItems(
    userId: string,
    updatedItems: ShoppingItem[]
  ): Promise<ShoppingCart> {
    const normalized = this.normalizeItems(updatedItems || []).map(
      (i, idx) => ({ ...i, order: idx, userId })
    );
    const total = this.computeTotal(normalized);
    const cart = await ShoppingCartModel.findOneAndUpdate(
      { userId },
      { $set: { items: normalized, total } },
      { new: true, upsert: true }
    );
    return cart!.toJSON();
  }

  public async reorderItems(
    userId: string,
    items: ShoppingItem[]
  ): Promise<ShoppingCart> {
    const sorted = (items || [])
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const normalized = sorted.map((i, idx) => ({
      ...i,
      id: i.id || randomId(12),
      order: idx,
      userId,
    }));
    const total = this.computeTotal(normalized);
    const cart = await ShoppingCartModel.findOneAndUpdate(
      { userId },
      { $set: { items: normalized, total } },
      { new: true, upsert: true }
    );
    return cart!.toJSON();
  }

  public async removeItem(userId: string, id: string): Promise<ShoppingCart> {
    await ShoppingCartModel.findOneAndUpdate(
      { userId },
      { $pull: { items: { id } } },
      { new: true }
    );
    return this.recomputeAndReturn(userId);
  }

  public async removeItems(
    userId: string,
    ids: string[]
  ): Promise<ShoppingCart> {
    await ShoppingCartModel.findOneAndUpdate(
      { userId },
      { $pull: { items: { id: { $in: ids } } } },
      { new: true }
    );
    return this.recomputeAndReturn(userId);
  }

  public async updateCartMeta(
    userId: string,
    meta: Partial<Pick<ShoppingCart, "title" | "spendLimit">>
  ): Promise<ShoppingCart> {
    const existing = await ShoppingCartModel.findOne({ userId });

    const setFields: Record<string, unknown> = {};
    if (typeof meta.title === "string") {
      setFields.title = meta.title;
    }
    const parsedLimit = meta.spendLimit as unknown as
      | number
      | string
      | undefined;
    const spendLimitNumber =
      parsedLimit !== undefined ? Number(parsedLimit) : undefined;
    if (spendLimitNumber !== undefined && Number.isFinite(spendLimitNumber)) {
      setFields.spendLimit = this.roundToTwoDecimals(spendLimitNumber);
    }

    // Normalize and compute total from current items
    const items = existing
      ? (existing.toJSON() as ShoppingCart).items || []
      : [];
    const normalized = this.normalizeItems(items);
    const total = this.computeTotal(normalized);

    const updated = await ShoppingCartModel.findOneAndUpdate(
      { userId },
      { $set: { ...setFields, items: normalized, total } },
      { new: true, upsert: true }
    );
    return updated!.toJSON();
  }
}
