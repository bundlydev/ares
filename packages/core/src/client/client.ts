import { Actor, ActorSubclass, HttpAgent, HttpAgentOptions, Identity, fromHex, toHex } from "@dfinity/agent";
import { DelegationChain, DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity";
import { EventEmitter as EventManager } from "events";

import restClient, { RestClientInstance } from "@bundly/ares-rest";

import { EventEmitter, EventListener } from "../events";
import { IdentityProvider } from "../identity-providers";
import { LocalStorage } from "../storage/local-storage";
import * as url from "../utils/url";
import { CanisterDoesNotExistError, ProviderNotFoundError } from "./client.errors";
import {
  ClientConfig,
  CreateClientConfig,
  GetCandidActorOptions,
  GetIdentitiesResult,
  IdentityMap,
  IdentityProviders,
  StoredIdentity,
} from "./client.types";

export const STORED_IDENTITIES_KEY = "STORED_IDENTITIES_KEY";

export class Client {
  private identities: IdentityMap = new Map();
  public eventEmitter: EventEmitter;
  public eventListener: EventListener;

  private constructor(private readonly config: ClientConfig) {
    this.eventEmitter = new EventEmitter(config.eventManager);
    this.eventListener = new EventListener(config.eventManager);
  }

  public async init(): Promise<void> {
    await this.loadStoredIdentities();
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

  public async addIdentity(
    delegation: DelegationChain,
    keyIdentity: Ed25519KeyIdentity,
    provider: string
  ): Promise<void> {
    try {
      const storedIdentity: StoredIdentity = {
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

      this.eventEmitter.identityAdded(identity, provider);
    } catch (error) {
      throw error;
    }
  }

  public async removeIdentity(identity: Identity): Promise<void> {
    const principalToRemove = identity.getPrincipal();

    const storedIdentities = await this.getStoredIdentities();

    const toStoreIdentities = storedIdentities.filter((item) => {
      const pubKey = fromHex(item.pubKey);
      const privateKey = fromHex(item.secretKey);
      const keyIdentity = Ed25519KeyIdentity.fromKeyPair(privateKey, pubKey);
      const delegation = DelegationChain.fromJSON(item.delegation);
      const delegationIdentity = DelegationIdentity.fromDelegation(keyIdentity, delegation);
      return delegationIdentity.getPrincipal().compareTo(principalToRemove) !== "eq";
    });

    await this.config.storage.setItem(STORED_IDENTITIES_KEY, JSON.stringify(toStoreIdentities));

    this.identities.delete(identity.getPrincipal().toString());

    this.eventEmitter.identityRemoved(identity);
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

  public getProvider(name: string): IdentityProvider {
    const provider = this.getProviders().find((provider) => provider.name === name);

    if (!provider) {
      throw new ProviderNotFoundError(name);
    }

    return provider;
  }

  public static create(config: CreateClientConfig): Client {
    const eventManager = new EventManager();
    const storage = new LocalStorage();
    const clientConfig = { storage, eventManager, ...config };

    return new Client(clientConfig);
  }
}
