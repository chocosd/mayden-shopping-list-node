import { App } from "./app";
import { AuthenticationController } from "./authentication/authentication.controller.ts";
import { ShoppingCartController } from "./routes/shopping-cart/shopping-cart.controller.ts";

try {
  const app = new App([
    new ShoppingCartController(),
    new AuthenticationController(),
  ]);

  app.listen();
} catch (error) {
  console.error("Startup Field:", error);
  console.error("Stack trace:", (error as Error).stack);
  process.exit(1);
}
