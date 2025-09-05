import { HttpException } from "./http.exception.ts";

export class WrongCredentials extends HttpException {
  constructor() {
    super(401, "Wrong credentials provided");
  }
}
