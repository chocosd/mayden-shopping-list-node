import type { Controller } from "../../shared/interfaces/controller.interface";

export function InitialiseRoutes() {
  return function <T extends { new (...args: any[]): Controller }>(
    constructor: T
  ): T {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        this.initialiseRoutes();
      }
    } as T;
  };
}
