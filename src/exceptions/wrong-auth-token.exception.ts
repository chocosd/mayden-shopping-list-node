import { HttpException } from "./http.exception.ts";

export class WrongAuthToken extends HttpException {
  constructor() {
    super(401, "Wrong authentication token");
  }
}
