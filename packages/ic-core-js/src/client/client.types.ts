import { ActorConfig, HttpAgentOptions } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";
import { EventEmitter as EventManager } from "events";

import { IdentityProvider } from "../identity-providers";

export type Canister = {
  agent?: HttpAgentOptions;
  idlFactory: IDL.InterfaceFactory;
  configuration: ActorConfig;
};

// TODO: implement correct idlFactory type
export type RestCanister = {
  agent?: HttpAgentOptions;
  idlFactory: IDL.InterfaceFactory;
  configuration: ActorConfig;
};

export interface ClientStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

export type CreateClientConfig = {
  agent: HttpAgentOptions;
  // @deprecated The method should not be used
  canisters?: Record<string, Canister>;
  candidCanisters?: Record<string, Canister>;
  restCanisters?: Record<string, RestCanister>;
  providers?: IdentityProviders;
  storage?: ClientStorage;
};

export type ClientConfig = {
  agent: HttpAgentOptions;
  // @deprecated The method should not be used
  canisters?: Record<string, Canister>;
  candidCanisters?: Record<string, Canister>;
  restCanisters?: Record<string, RestCanister>;
  providers?: IdentityProviders;
  storage: ClientStorage;
  eventManager: EventManager;
};

export type IdentityProviders = IdentityProvider[];
