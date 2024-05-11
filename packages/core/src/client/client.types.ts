import { ActorConfig, HttpAgentOptions, Identity } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";

import { ClientStorageInterface } from "../storage/storage.interface";
import { StoredIdentity } from "./identity-manager";
import { IdentityProvider } from "./identity-provider";

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
