import { ActorConfig, HttpAgentOptions, Identity } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";

import { IdentityProvider } from "../identity/identity-provider";
import { ClientStorageInterface } from "../storage/storage.interface";

export type GetIdentitiesResult = {
  identity: Identity;
  provider: string;
}[];

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
  candidCanisters?: Record<string, CandidCanister>;
  restCanisters?: Record<string, RestCanister>;
  providers?: IdentityProviders;
  storage?: ClientStorageInterface;
};

export type ClientConfig = {
  agentConfig?: HttpAgentOptions;
  candidCanisters?: Record<string, CandidCanister>;
  restCanisters?: Record<string, RestCanister>;
  providers?: IdentityProviders;
  storage: ClientStorageInterface;
};

export type IdentityProviders = IdentityProvider[];

export type GetCandidActorOptions = {
  canisterId?: string;
};
