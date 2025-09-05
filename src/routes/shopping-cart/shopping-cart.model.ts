import mongoose from "mongoose";
import type { ShoppingCart } from "./shopping-cart.interface.ts";

// now lets add indexes to the schema

const ShoppingItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  bought: {
    type: Boolean,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
});

const ShoppingCartSchema = new mongoose.Schema(
  {
    items: {
      type: [ShoppingItemSchema],
      required: true,
      default: [],
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    spendLimit: {
      type: Number,
      required: true,
      default: 0,
    },
    title: {
      type: String,
      required: true,
      default: "My Shopping List",
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      virtuals: false,
      versionKey: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        // Always strip Mongo _id from cart
        if (ret && typeof ret === "object" && "_id" in ret) {
          delete ret._id;
        }
        if (Array.isArray(ret?.items) && !!ret.items.length) {
          ret.items = ret.items?.map((item: any) => {
            if (item && typeof item === "object" && "_id" in item) {
              const { _id, userId, __v, ...rest } = item;
              return rest;
            }
            return item;
          });
        }
        return ret;
      },
    },
  }
);

export const ShoppingCartModel = mongoose.model<
  ShoppingCart & mongoose.Document
>("ShoppingCart", ShoppingCartSchema);
