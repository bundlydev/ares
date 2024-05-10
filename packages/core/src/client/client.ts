import { Actor, ActorSubclass, HttpAgent, HttpAgentOptions, Identity, fromHex, toHex } from "@dfinity/agent";
import { DelegationChain, DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity";
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
  GetIdentitiesResult,
  IdentityMap,
  IdentityProviders,
  StoredIdentity,
} from "./client.types";

export const CURRENT_PROVIDER_KEY = "CURRENT_PROVIDER_KEY";
export const STORED_IDENTITIES_KEY = "STORED_IDENTITIES_KEY";

export class Client {
  private identities: IdentityMap = new Map();
  private currentProvider: IdentityProvider | undefined;
  public eventEmitter: EventEmitter;
  public eventListener: EventListener;

  private constructor(private readonly config: ClientConfig) {
    this.eventEmitter = new EventEmitter(config.eventManager);
    this.eventListener = new EventListener(config.eventManager);

    this.setEventListeners();
  }

  public async init(): Promise<void> {
    await this.loadStoredIdentities();
    const currentProvider = await this.config.storage.getItem(CURRENT_PROVIDER_KEY);

    if (currentProvider) {
      await this.setCurrentProvider(currentProvider);
    }
  }

  private setEventListeners(): void {
    this.eventListener.connectSuccess((payload) => {
      const { delegation, keyIdentity, provider } = payload;
      this.registerIdentity(delegation, keyIdentity, provider);
    });

    this.eventListener.disconnectSuccess((payload) => {
      this.removeIdentity(payload.identity.getPrincipal());
    });
  }

  private createAgent(options: HttpAgentOptions): HttpAgent {
    const agent = new HttpAgent(options);

    // Host is defined in createAgentOptions
    url.isLocal(options.host!) && agent.fetchRootKey().then(() => console.log("Root key fetched"));

    return agent;
  }

  private async loadStoredIdentities(): Promise<void> {
    const storedIdentities = await this.config.storage.getItem(STORED_IDENTITIES_KEY);
    const identities: StoredIdentity[] = storedIdentities ? JSON.parse(storedIdentities) : [];
    console.log("Identities", identities);

    for (const identity of identities) {
      const pubKey = fromHex(identity.pubKey);
      const privateKey = fromHex(identity.secretKey);
      const keyIdentity = Ed25519KeyIdentity.fromKeyPair(privateKey, pubKey);
      const delegation = DelegationChain.fromJSON(identity.delegation);
      const delegationIdentity = DelegationIdentity.fromDelegation(keyIdentity, delegation);
      const principal = delegationIdentity.getPrincipal().toString();

      this.identities.set(principal, {
        identity: delegationIdentity,
        provider: identity.provider,
      });
    }
  }

  private async getStoredIdentities(): Promise<StoredIdentity[]> {
    const storedIdentities = await this.config.storage.getItem(STORED_IDENTITIES_KEY);
    const identities: StoredIdentity[] = storedIdentities ? JSON.parse(storedIdentities) : [];
    return identities;
  }

  public getIdentities(): GetIdentitiesResult {
    const identities = Array.from(this.identities.entries()).map(([_, { identity, provider }]) => ({
      identity,
      provider,
    }));

    return identities;
  }

  private async storeIdentity(identity: StoredIdentity): Promise<void> {
    const storedIdentities = await this.getStoredIdentities();
    storedIdentities.push(identity);
    this.config.storage.setItem(STORED_IDENTITIES_KEY, JSON.stringify(storedIdentities));
  }

  public async registerIdentity(
    delegation: DelegationChain,
    keyIdentity: Ed25519KeyIdentity,
    provider: string
  ): Promise<void> {
    const storedIdentity: StoredIdentity = {
      // keyIdentity: keyIdentity,
      secretKey: toHex(keyIdentity.getKeyPair().secretKey),
      pubKey: toHex(keyIdentity.getPublicKey().toDer()),
      delegation: delegation,
      provider,
    };

    await this.storeIdentity(storedIdentity);

    const identity = DelegationIdentity.fromDelegation(keyIdentity, delegation);

    this.identities.set(identity.getPrincipal().toString(), {
      identity,
      provider,
    });
  }

  public removeIdentity(principal: Principal): void {
    this.identities.delete(principal.toString());
  }

  private createAgentOptions(identity: Identity, agentConfig?: HttpAgentOptions) {
    const baseOptions = agentConfig || this.config.agentConfig;

    if (!baseOptions) {
      throw new Error("You must provide an agent for the canister or set a default agent.");
    }

    const options = {
      ...baseOptions,
      host: baseOptions.host || "http://localhost:4943",
      identity,
    };

    return options;
  }

  // TODO: Options should be optional?
  public getCandidActor(name: string, identity: Identity, options?: GetCandidActorOptions): ActorSubclass {
    const canister = this.config.candidCanisters?.get(name);

    if (!canister) {
      throw new CanisterDoesNotExistError(name);
    }

    const agentOptions = this.createAgentOptions(identity, canister.agentConfig);
    const agent = this.createAgent({
      ...agentOptions,
    });

    url.isLocal(agentOptions.host) && agent.fetchRootKey().then(() => console.log("Root key fetched"));

    const actor = Actor.createActor(canister.idlFactory, {
      ...canister.actorConfig,
      canisterId: options?.canisterId || canister.actorConfig.canisterId,
      agent,
    });

    return actor;
  }

  public getRestActor(name: string, identity: Identity): RestClientInstance {
    const canister = this.config.restCanisters?.get(name);

    if (!canister) {
      throw new CanisterDoesNotExistError(name);
    }

    // TODO: Modify restClient to accept an agent
    const actor = restClient.create({
      baseURL: canister?.baseUrl,
      identity,
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
        await this.config.storage.setItem(CURRENT_PROVIDER_KEY, currentProvider.name);
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
