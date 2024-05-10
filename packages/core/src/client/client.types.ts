import { ActorConfig, HttpAgentOptions, Identity } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";
import { DelegationIdentity } from "@dfinity/identity";
import { EventEmitter as EventManager } from "events";

import { IdentityProvider } from "../identity-providers";
import { StorageInterface } from "../storage/storage.interface";

export type StoredIdentity = {
  // keyIdentity
  // keyIdentity: ECDSAKeyIdentity;
  // keyIdentity to string in hex
  secretKey: string;
  // publicKey to string in hex
  pubKey: string;
  // Delegation Chain to string
  delegation: any;
  // Identity provider name
  provider: string;
};

export type GetIdentitiesResult = {
  identity: Identity;
  provider: string;
}[];

export type IdentityObject = {
  identity: DelegationIdentity;
  provider: string;
};

// string is a Principal in string format
export type IdentityMap = Map<string, IdentityObject>;

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

export type GetCandidActorOptions = {
  canisterId?: string;
};
