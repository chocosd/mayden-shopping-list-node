export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  order: number;
  bought: boolean;
}

export interface ShoppingCart {
  items: ShoppingItem[];
  total: number;
  spendLimit: number;
  title?: string;
  userId: string;
}

export type ShoppingCartDTO = Omit<ShoppingCart, "userId">;
