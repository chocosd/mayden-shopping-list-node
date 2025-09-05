import type { Request } from "express";
import type { User } from "../../authentication/users.interface.ts";

export interface RequestWithUser<TQuery = unknown>
  extends Omit<Request, "query"> {
  user?: User | null;
  query: TQuery;
}

// For routes protected by authMiddleware - user is guaranteed to exist
export interface AuthenticatedRequest<TQuery = unknown>
  extends Omit<Request, "query"> {
  user: User;
  query: TQuery;
}

export interface TokenData {
  userId: string;
}
