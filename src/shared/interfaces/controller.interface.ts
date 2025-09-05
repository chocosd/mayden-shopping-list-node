import { Router } from "express";

export interface Controller {
  initialiseRoutes(): void;
  router?: Router;
}
