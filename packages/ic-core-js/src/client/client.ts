import { Actor, ActorMethod, AnonymousIdentity, HttpAgent, Identity } from "@dfinity/agent";
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
  private actors: Record<string, ActorMethod> = {};
  private restActors: Record<string, HttpClient> = {};
  private identity = new AnonymousIdentity();
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
    } else {
      await this.setActors(this.identity);
      await this.setRestActors(this.identity);
    }
  }

  public async replaceIdentity(identity: Identity): Promise<void> {
    this.identity = identity;

    await this.setActors(this.identity);
    await this.setRestActors(this.identity);
  }

  public getIdentity(): Identity {
    return this.identity;
  }

  private actorsFactory(identity: Identity, canisters?: Record<string, Canister>): Record<string, ActorMethod> {
    const { agent } = this.config;

    if (!canisters) return {};

    const defaultHost = agent.host || "http://localhost:4943";

    const defaultAgent = new HttpAgent({ ...agent, host: defaultHost, identity });

    url.isLocal(defaultHost) && defaultAgent.fetchRootKey().then(() => console.log("Root key fetched"));

    const actors = Object.entries(canisters).reduce((reducer, current) => {
      const [name, canister] = current;

      let localAgent: HttpAgent | undefined;

      if (canister.agent) {
        const localHost = canister.agent.host || "http://localhost:4943";

        localAgent = new HttpAgent({ ...canister.agent, host: localHost, identity });

        url.isLocal(localHost) && localAgent.fetchRootKey().then(() => console.log("Root key fetched"));
      }

      const { idlFactory, configuration } = canister;

      const actor = Actor.createActor(idlFactory, {
        agent: localAgent || defaultAgent,
        ...configuration,
      });

      return {
        ...reducer,
        [name]: actor,
      };
    }, {});

    return actors;
  }

  private async setActors(identity: Identity): Promise<void> {
    const { canisters } = this.config;
    this.actors = this.actorsFactory(identity, canisters);
  }

  public getActor(name: string) {
    return this.actors[name];
  }

  public setRestActors(identity: Identity) {
    const { restCanisters } = this.config;
    const actors = this.actorsFactory(identity, restCanisters);

    const restActors: Record<string, HttpClient> = Object.entries(actors).reduce((reducer, current) => {
      const [name, actor] = current;

      return {
        ...reducer,
        [name]: new HttpClient(actor as any),
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
