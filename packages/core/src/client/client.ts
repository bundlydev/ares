import {
  Actor,
  ActorSubclass,
  AnonymousIdentity,
  HttpAgent,
  HttpAgentOptions,
  Identity,
} from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { EventEmitter as EventManager } from "events";

import restClient, { RestClientInstance } from "@bundly/ares-rest";

import {
  AuthConnectErrorPayload,
  AuthConnectSuccessPayload,
  AuthDisconnectErrorPayload,
  EventEmitter,
  EventListener,
} from "../events";
import { IdentityProvider } from "../identity-providers";
import { LocalStorage } from "../storage/local-storage";
import * as url from "../utils/url";
import { CanisterDoesNotExistError } from "./client.errors";
import {
  ClientConfig,
  CreateClientConfig,
  GetCandidActorOptions,
  IdentityMap,
  IdentityProviders,
  StoredIdentity,
} from "./client.types";

export const CURRENT_PROVIDER_KEY = "CURRENT_PROVIDER_KEY";

export class Client {
  private identity = new AnonymousIdentity();
  // TODO: use this for multiple identities
  private identities: IdentityMap = new Map();
  private currentProvider: IdentityProvider | undefined;
  public eventEmitter: EventEmitter;
  public eventListener: EventListener;

  private constructor(private readonly config: ClientConfig) {
    this.eventEmitter = new EventEmitter(config.eventManager);
    this.eventListener = new EventListener(config.eventManager);
  }

  public async init(): Promise<void> {
    const currentProvider = await this.config.storage.getItem(CURRENT_PROVIDER_KEY);

    if (currentProvider) {
      await this.setCurrentProvider(currentProvider);
    }
  }

  private createAgent(options: HttpAgentOptions): HttpAgent {
    const agent = new HttpAgent(options);

    // Host is defined in createAgentOptions
    url.isLocal(options.host!) && agent.fetchRootKey().then(() => console.log("Root key fetched"));

    return agent;
  }

  public async replaceIdentity(identity: Identity): Promise<void> {
    this.identity = identity;
  }

  public getIdentities(): IdentityMap {
    return this.identities;
  }

  public setIdentity(principal: Principal, identity: StoredIdentity): void {
    console.log("Setting identity", principal.toString(), identity);
    this.identities.set(principal.toString(), identity);
  }

  public removeIdentity(principal: Principal): void {
    this.identities.delete(principal.toString());
  }

  public getIdentity(): Identity {
    return this.identity;
  }

  private createAgentOptions(agentConfig?: HttpAgentOptions) {
    const baseOptions = agentConfig || this.config.agentConfig;

    if (!baseOptions) {
      throw new Error("You must provide an agent for the canister or set a default agent.");
    }

    const options = {
      ...baseOptions,
      host: baseOptions.host || "http://localhost:4943",
      identity: this.identity,
    };

    return options;
  }

  // TODO: Options should be optional?
  public getCandidActor(name: string, options: GetCandidActorOptions): ActorSubclass {
    const canister = this.config.candidCanisters?.get(name);

    if (!canister) {
      throw new CanisterDoesNotExistError(name);
    }

    const agentOptions = this.createAgentOptions(canister.agentConfig);
    const agent = this.createAgent({
      ...agentOptions,
      // TODO: remove agentOptions.identity
      identity: options.identity || agentOptions.identity,
    });

    url.isLocal(agentOptions.host) && agent.fetchRootKey().then(() => console.log("Root key fetched"));

    const actor = Actor.createActor(canister.idlFactory, {
      ...canister.actorConfig,
      canisterId: options.canisterId || canister.actorConfig.canisterId,
      agent,
    });

    return actor;
  }

  public getRestActor(name: string): RestClientInstance {
    const canister = this.config.restCanisters?.get(name);

    if (!canister) {
      throw new CanisterDoesNotExistError(name);
    }

    // TODO: Modify restClient to accept an agent
    const actor = restClient.create({
      baseURL: canister?.baseUrl,
      identity: this.identity,
    });

    return actor;
  }

  public getProviders(): IdentityProviders {
    return this.config.providers || [];
  }

  public getProvider(name: string): IdentityProvider | undefined {
    return this.getProviders().find((provider) => provider.name === name);
  }

  // TODO: Provider management should be outside of the client
  public async setCurrentProvider(provider: string): Promise<void> {
    const currentProvider = this.getProvider(provider);

    if (currentProvider) {
      try {
        const initOptions = {
          connect: {
            onSuccess: (payload: AuthConnectSuccessPayload) => this.eventEmitter.connectSuccess(payload),
            onError: (payload: AuthConnectErrorPayload) => this.eventEmitter.connectError(payload),
          },
          disconnect: {
            onSuccess: () => this.eventEmitter.disconnectSuccess(),
            onError: (payload: AuthDisconnectErrorPayload) => this.eventEmitter.disconnectError(payload),
          },
        };

        await currentProvider.init(initOptions);
        const identity = currentProvider.getIdentity();
        await this.config.storage.setItem(CURRENT_PROVIDER_KEY, currentProvider.name);
        this.replaceIdentity(identity);
        this.currentProvider = currentProvider;
      } catch (error) {
        console.error(error);
        throw error;
      }
    } else {
      this.removeCurrentProvider();
    }
  }

  public async removeCurrentProvider(): Promise<void> {
    await this.config.storage.removeItem(CURRENT_PROVIDER_KEY);
    this.replaceIdentity(new AnonymousIdentity());
    this.currentProvider = undefined;
  }

  public getCurrentProvider(): IdentityProvider | undefined {
    return this.currentProvider;
  }

  public static create(config: CreateClientConfig): Client {
    const eventManager = new EventManager();
    const storage = new LocalStorage();
    const clientConfig = { storage, eventManager, ...config };

    return new Client(clientConfig);
  }
}
