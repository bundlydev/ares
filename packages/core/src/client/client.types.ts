import { ActorConfig, HttpAgentOptions, Identity } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";

import { IdentityProvider } from "../identity-providers";
import { ClientStorageInterface } from "../storage/storage.interface";
import { StoredIdentity } from "./identity-manager";

export type GetIdentitiesResult = {
  identity: Identity;
  provider: string;
}[];

// string is a Principal in string format
export type IdentityMap = Map<string, StoredIdentity>;

export type CandidCanister = {
  agentConfig?: HttpAgentOptions;
  idlFactory: IDL.InterfaceFactory;
  actorConfig: ActorConfig;
};

// TODO: implement correct idlFactory type
export type RestCanister = {
  baseUrl: string;
  agentConfig?: HttpAgentOptions;
};

export type CreateClientConfig = {
  agentConfig?: HttpAgentOptions;
  candidCanisters?: Map<string, CandidCanister>;
  providers?: IdentityProviders;
  restCanisters?: Map<string, RestCanister>;
  storage?: ClientStorageInterface;
};

export type ClientConfig = {
  agentConfig?: HttpAgentOptions;
  candidCanisters?: Map<string, CandidCanister>;
  providers?: IdentityProviders;
  restCanisters?: Map<string, RestCanister>;
  storage: ClientStorageInterface;
};

export type IdentityProviders = IdentityProvider[];

export type GetCandidActorOptions = {
  canisterId?: string;
};

export interface ClientStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: any): Promise<void>;
  remove(key: string): Promise<void>;
}
