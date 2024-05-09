export class CanisterDoesNotExistError extends Error {
  constructor(canisterId: string) {
    super(`Canister ${canisterId} does not exist`);
  }
}
