import { ActorConfig, Agent, HttpAgentOptions } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";
import { Principal } from "@dfinity/principal";

import { IdentityProvider } from "../identity-providers";

export type CreateActorOptions = {
  /**
   * @see {@link Agent}
   */
  agent?: Agent;
  /**
   * @see {@link HttpAgentOptions}
   */
  agentOptions?: HttpAgentOptions;
  /**
   * @see {@link ActorConfig}
   */
  actorOptions?: ActorConfig;
};

export type ActorSubclassType<T extends Record<string, any>, K extends keyof T> = ReturnType<
  T[K]["createActor"]
>;

export type CanisterType<T> = {
  canisterId: string | Principal;
  createActor: (canisterId: string | Principal, options?: CreateActorOptions) => T;
  idlFactory: IDL.InterfaceFactory;
  configuration?: ActorConfig;
};

export type CanisterMap<T extends Record<string, any>> = {
  [K in keyof T]: CanisterType<ActorSubclassType<T, K>>;
};

export type CreateClientOptions<T extends Record<string, any>> = {
  host: string;
  canisters: CanisterMap<T>;
  providers: IdentityProviders;
};

export type ActorMap<T extends Record<string, any>> = {
  [K in keyof T]: ActorSubclassType<T, K>;
};

export type IdentityProviders = { [key: string]: IdentityProvider };
