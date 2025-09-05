import { HttpException } from "./http.exception.ts";

export class MissingAuthToken extends HttpException {
  constructor() {
    super(401, "Authentication token missing");
  }
}
