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

export class AgentNotDefinedError extends Error {
  constructor() {
    super("You must provide an agent for the canister or set a default agent");
  }
}
