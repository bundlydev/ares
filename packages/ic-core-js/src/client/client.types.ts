import { ActorConfig, HttpAgentOptions } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";

import { IdentityProvider } from "../identity-providers";

export type Canister = {
  agent?: HttpAgentOptions;
  idlFactory: IDL.InterfaceFactory;
  configuration: ActorConfig;
};

export type ClientConfig = {
  agent: HttpAgentOptions;
  canisters: Record<string, Canister>;
  identityProviders: IdentityProviders;
};

export type IdentityProviders = { [key: string]: IdentityProvider };
