import { ActorConfig, HttpAgentOptions } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";

import { IdentityProvider } from "../identity-providers";

export type Canister = {
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
  canisters: Record<string, Canister>;
  providers?: IdentityProviders;
  storage?: ClientStorage;
};

export type ClientConfig = {
  agent: HttpAgentOptions;
  canisters: Record<string, Canister>;
  providers?: IdentityProviders;
  storage: ClientStorage;
};

export type IdentityProviders = IdentityProvider[];
