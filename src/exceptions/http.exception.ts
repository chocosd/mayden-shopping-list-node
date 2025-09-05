export class HttpException extends Error {
  public errorStatus: number;
  public errorMessage: string;

  constructor(public status: number, public message: string) {
    super(message);
    this.errorStatus = status;
    this.errorMessage = message;
  }
}
