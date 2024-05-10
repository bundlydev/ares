export class CanisterDoesNotExistError extends Error {
  constructor(canisterId: string) {
    super(`Canister ${canisterId} does not exist`);
  }
}

export class ProviderNotFoundError extends Error {
  constructor(providerName: string) {
    super(`Provider ${providerName} not found`);
  }
}
