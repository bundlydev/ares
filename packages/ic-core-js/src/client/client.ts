import { Actor, ActorMethod, AnonymousIdentity, HttpAgent, HttpAgentOptions, Identity } from "@dfinity/agent";
import { EventEmitter as EventManager } from "events";

import { HttpClient } from "@bundly/ic-http-client";

import {
  AuthConnectErrorPayload,
  AuthConnectSuccessPayload,
  AuthDisconnectErrorPayload,
  EventEmitter,
  EventListener,
} from "../events";
import { IdentityProvider } from "../identity-providers";
import * as url from "../utils/url";
import { Canister, ClientConfig, ClientStorage, CreateClientConfig, IdentityProviders } from "./client.types";

export const CURRENT_PROVIDER_KEY = "current-identity-provider";

export class Client {
  private candidActors: Record<string, ActorMethod> = {};
  private restActors: Record<string, HttpClient> = {};
  private identity = new AnonymousIdentity();
  private currentProvider: IdentityProvider | undefined;
  private defaultAgent: HttpAgent | undefined;
  private candidAgents: Record<string, HttpAgent> = {};
  public eventEmitter: EventEmitter;
  public eventListener: EventListener;

  private constructor(private readonly config: ClientConfig) {
    const { canisters = {}, agent } = this.config;

    if (agent) {
      this.defaultAgent = this.createAgent(agent, this.identity);
    }

    this.initCandidAgents(canisters, this.identity);
    this.initCandidActors();
    this.initRestActors();

    this.eventEmitter = new EventEmitter(config.eventManager);
    this.eventListener = new EventListener(config.eventManager);
  }

  public async init(): Promise<void> {
    const currentProvider = await this.config.storage.getItem(CURRENT_PROVIDER_KEY);

    if (currentProvider) {
      await this.setCurrentProvider(currentProvider);
    }
  }

  private createAgent(options: HttpAgentOptions, identity?: Identity): HttpAgent {
    const host = options.host || "http://localhost:4943";
    const agent = new HttpAgent({ ...options, host, identity });

    url.isLocal(host) && agent.fetchRootKey().then(() => console.log("Root key fetched"));

    return agent;
  }

  private initCandidAgents(canisters: Record<string, Canister>, identity?: Identity): void {
    const agents = Object.entries(canisters)
      .filter(([key, data]) => data.agent)
      .reduce((reducer: Record<string, HttpAgent>, [name, data]) => {
        const agent = this.createAgent(data.agent as HttpAgentOptions, identity);

        return {
          ...reducer,
          [name]: agent,
        };
      }, {});

    this.candidAgents = agents;
  }

  public async replaceIdentity(identity: Identity): Promise<void> {
    this.identity = identity;

    // Replace identity in agents default agent
    if (this.defaultAgent) {
      this.defaultAgent.replaceIdentity(identity);
    }

    // Replace identity in candid agents
    Object.entries(this.candidAgents).forEach(([name, agent]) => {
      agent.replaceIdentity(identity);
    });

    // Replace identity in rest agents
    Object.entries(this.restActors).forEach(([name, actor]) => {
      actor.replaceIdentity(identity);
    });
  }

  public getIdentity(): Identity {
    return this.identity;
  }

  private actorsFactory(agents: Record<string, HttpAgent>, canisters?: Record<string, Canister>): Record<string, ActorMethod> {
    if (!canisters) return {};

    const actors = Object.entries(canisters).reduce((reducer, current) => {
      const [name, canister] = current;

      const { idlFactory, configuration } = canister;

      const agent = agents[name] || this.defaultAgent;

      if (!agent) {
        throw new Error("You must provide an agent for the canister or set a default agent.");
      }

      const actor = Actor.createActor(idlFactory, {
        agent,
        ...configuration,
      });

      return {
        ...reducer,
        [name]: actor,
      };
    }, {});

    return actors;
  }

  private initCandidActors(): void {
    const { candidCanisters, canisters } = this.config;
    // TODO: remove canisters
    this.candidActors = this.actorsFactory(this.candidAgents, candidCanisters || canisters);
  }

  /**
  * @deprecated The method should not be used, use getCandidActor instead
  */
  public getActor(name: string) {
    return this.candidActors[name];
  }

  public getCandidActor(name: string) {
    return this.candidActors[name];
  }

  public initRestActors() {
    const { restCanisters = {} } = this.config;

    const restActors: Record<string, HttpClient> = Object.entries(restCanisters).reduce((reducer, current) => {
      const [name, config] = current;

      return {
        ...reducer,
        [name]: new HttpClient(config.baseUrl, {
          agentOptions: config.agentOptions,
          actorOptions: config.actorOptions,
        }),
      };
    }, {});

    this.restActors = restActors;
  }

  public getRestActor(name: string): HttpClient {
    return this.restActors[name];
  }

  public getProviders(): IdentityProviders {
    return this.config.providers || [];
  }

  public getProvider(name: string): IdentityProvider | undefined {
    return this.getProviders().find((provider) => provider.name === name);
  }

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

  public static create(config: CreateClientConfig) {
    const eventManager = new EventManager();
    const storage = new ReactStorage();
    const clientConfig = { storage, eventManager, ...config };

    return new Client(clientConfig);
  }
}

class ReactStorage implements ClientStorage {
  public async getItem(key: string) {
    return localStorage.getItem(key);
  }

  public async setItem(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  public async removeItem(key: string) {
    localStorage.removeItem(key);
  }
}
