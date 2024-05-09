import { ActorConfig, HttpAgentOptions, Identity } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";
import { EventEmitter as EventManager } from "events";

import { IdentityProvider } from "../identity-providers";
import { StorageInterface } from "../storage/storage.interface";

export type IdentityMap = Map<string, { identity: Identity; provider: string }>;

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
  restCanisters?: Map<string, RestCanister>;
  providers?: IdentityProviders;
  storage?: StorageInterface;
};

export type ClientConfig = {
  agentConfig?: HttpAgentOptions;
  candidCanisters?: Map<string, CandidCanister>;
  restCanisters?: Map<string, RestCanister>;
  providers?: IdentityProviders;
  storage: StorageInterface;
  eventManager: EventManager;
};

export type IdentityProviders = IdentityProvider[];
