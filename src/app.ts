import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express, { type Application } from "express";
import mongoose from "mongoose";
import { UserModel } from "./authentication/users.model.ts";
import { corsMiddleware } from "./middleware/cors.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import { ShoppingCartModel } from "./routes/shopping-cart/shopping-cart.model.ts";
import { Controller } from "./shared/interfaces/controller.interface";

export class App {
  public app: Application;
  public port: string | number;

  constructor(controllers: Controller[]) {
    dotenv.config();

    this.app = express();
    this.port = process.env.PORT || 3000;

    this.connectToDatabase();
    this.initializeMiddleware();
    this.initializeControllers(controllers);
    /* initialize error handling */
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    this.app.use(corsMiddleware);
    this.app.use(express.json());
    this.app.use(express.static("public"));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeControllers(controllers: Controller[]): void {
    controllers.forEach((controller) => {
      if (!controller.router) {
        throw new Error("Router is not defined");
      }

      this.app.use("/", controller.router);
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }

  private connectToDatabase(): void {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined");
    }

    mongoose
      .connect(mongoUri)
      .then(async () => {
        // Just a safeguard to ensure DB indexes reflect current schemas and to drop any obsolete indexes
        try {
          await UserModel.syncIndexes();
          await ShoppingCartModel.syncIndexes();
        } catch (e) {
          console.warn("Index sync failed:", e);
        }
      })
      .catch((error) => {
        console.error("Error connecting to mongoDB", error);
        throw error;
      });
  }

  public listen(): void {
    this.app.listen(this.port, () =>
      console.log(`App listening on port ${this.port}`)
    );
  }
}
