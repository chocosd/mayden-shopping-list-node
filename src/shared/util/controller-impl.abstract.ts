import { Router } from "express";

export abstract class ControllerImpl {
  abstract path: string;
  public router: Router = Router();
}
