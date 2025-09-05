import mongoose from "mongoose";
import type { User } from "./users.interface.ts";

// TODO: add indexes to the schema

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    collection: "users",
  }
);

export const UserModel = mongoose.model<User & mongoose.Document>(
  "User",
  userSchema
);
