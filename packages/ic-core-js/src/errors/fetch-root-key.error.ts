export class FetchRootKeyError extends Error {
  constructor(message: any) {
    super(message);
    this.name = "FetchRootKeyError";
  }
}
