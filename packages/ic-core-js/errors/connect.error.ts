export class ConnectError extends Error {
  constructor(message: any) {
    super(message);
    this.name = "ConnectError";
  }
}
