import {
  Actor,
  ActorSubclass,
  AnonymousIdentity,
  HttpAgent,
  HttpAgentOptions,
  Identity,
} from "@dfinity/agent";
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
  CandidCanister,
  ClientConfig,
  CreateClientConfig,
  IdentityMap,
  IdentityProviders,
} from "./client.types";

export const CURRENT_PROVIDER_KEY = "CURRENT_PROVIDER_KEY";

export class Client {
  private restActors: Record<string, RestClientInstance> = {};
  private identity = new AnonymousIdentity();
  // TODO: use this for multiple identities
  private identities: IdentityMap = new Map();
  private currentProvider: IdentityProvider | undefined;
  private defaultAgent: HttpAgent | undefined;
  private candidAgents: Map<string, HttpAgent> = new Map();
  public eventEmitter: EventEmitter;
  public eventListener: EventListener;

  private constructor(private readonly config: ClientConfig) {
    const { candidCanisters, agentConfig } = this.config;

    if (agentConfig) {
      this.defaultAgent = this.createAgent(this.identity, agentConfig);
    }

    if (candidCanisters) {
      this.initCandidAgents(candidCanisters, this.identity);
    }

    this.eventEmitter = new EventEmitter(config.eventManager);
    this.eventListener = new EventListener(config.eventManager);
  }

  public async init(): Promise<void> {
    const currentProvider = await this.config.storage.getItem(CURRENT_PROVIDER_KEY);

    if (currentProvider) {
      await this.setCurrentProvider(currentProvider);
    }
  }

  private initCandidAgents(canisters: Map<string, CandidCanister>, identity: Identity): void {
    if (canisters.size === 0) return;

    for (const [name, canister] of canisters.entries()) {
      if (!canister.agentConfig) continue;

      const agent = this.createAgent(identity, canister.agentConfig as HttpAgentOptions);

      this.candidAgents.set(name, agent);
    }
  }

  private createAgent(identity: Identity, options: HttpAgentOptions = {}): HttpAgent {
    const host = options.host || "http://localhost:4943";
    const agent = new HttpAgent({ host, identity, ...options });

    url.isLocal(host) && agent.fetchRootKey().then(() => console.log("Root key fetched"));

    return agent;
  }

  public async replaceIdentity(identity: Identity): Promise<void> {
    this.identity = identity;

    // Replace identity in default agent
    if (this.defaultAgent) {
      this.defaultAgent.replaceIdentity(identity);
    }

    // Replace identity in candid agents
    Object.entries(this.candidAgents).forEach(([name, agent]) => {
      agent.replaceIdentity(identity);
    });

    // Replace identity in rest actors
    Object.entries(this.restActors).forEach(([name, actor]) => {
      actor.replaceIdentity(identity);
    });
  }

  public getIdentity(): Identity {
    return this.identity;
  }

  public getCandidActor(name: string): ActorSubclass {
    const canister = this.config.candidCanisters?.get(name);

    if (!canister) {
      throw new CanisterDoesNotExistError(name);
    }

    const agent = this.candidAgents.get(name) || this.defaultAgent;

    if (!agent) {
      throw new Error("You must provide an agent for the canister or set a default agent.");
    }

    const actor = Actor.createActor(canister.idlFactory, {
      agent,
      ...canister.actorConfig,
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
