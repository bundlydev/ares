import { Actor, ActorMethod, AnonymousIdentity, HttpAgent, Identity } from "@dfinity/agent";

import { IdentityProvider } from "../identity-providers";
import { ClientConfig, ClientStorage, CreateClientConfig, IdentityProviders } from "./client.types";

export const CURRENT_PROVIDER_KEY = "current-identity-provider";

export class Client {
  private actors: Record<string, ActorMethod> = {};
  private identity = new AnonymousIdentity();
  private currentProvider: IdentityProvider | undefined;

  private constructor(private readonly config: ClientConfig) { }

  public async init(): Promise<void> {
    const currentProvider = await this.config.storage.getItem(CURRENT_PROVIDER_KEY);

    if (currentProvider) {
      await this.setCurrentProvider(currentProvider);
    } else {
      await this.setActors(this.identity);
    }
  }

  private isLocal(host: string): boolean {
    const { hostname } = new URL(host);
    const localHostNames = ["127.0.0.1", "localhost"];
    // TODO: wildcard for ngrok free and premium
    const ngrokHostName = /^.*\.ngrok-free\.app$/;
    const localtunelHostName = /^.*\.loca\.lt$/;

    const isLocal =
      localHostNames.includes(hostname) || ngrokHostName.test(hostname) || localtunelHostName.test(hostname);

    return isLocal;
  }

  public async replaceIdentity(identity: Identity): Promise<void> {
    this.identity = identity;

    await this.setActors(this.identity);
  }

  public getIdentity(): Identity {
    return this.identity;
  }

  private async setActors(identity: Identity): Promise<void> {
    const { agent, canisters } = this.config;

    const defaultHost = agent.host || "http://localhost:4943";

    const defaultAgent = new HttpAgent({ ...agent, host: defaultHost, identity });

    this.isLocal(defaultHost) && defaultAgent.fetchRootKey().then(() => console.log("Root key fetched"));

    const actors = Object.entries(canisters).reduce((reducer, current) => {
      const [name, canister] = current;

      let localAgent: HttpAgent | undefined;

      if (canister.agent) {
        const localHost = canister.agent.host || "http://localhost:4943";

        localAgent = new HttpAgent({ ...canister.agent, host: localHost, identity });

        this.isLocal(localHost) && localAgent.fetchRootKey().then(() => console.log("Root key fetched"));
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

    this.actors = actors;
  }

  public getActor(name: string) {
    return this.actors[name];
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
        await currentProvider.init();
        const identity = currentProvider.getIdentity();
        await this.config.storage.setItem(CURRENT_PROVIDER_KEY, currentProvider.name);
        this.replaceIdentity(identity);
        this.currentProvider = currentProvider;
      } catch (error) {
        console.error(error);
        throw error;
      }
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
    const storage = new ReactStorage();

    const clientConfig = { storage, ...config };

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
