import { HttpException } from "./http.exception.ts";

export class AuthTokenFail extends HttpException {
  constructor(private jwtError: string) {
    super(400, `Auth token sign failed: ${jwtError}`);
  }
}
