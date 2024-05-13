import { Identity } from "@dfinity/agent";
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
  JsonnableDelegationChain,
} from "@dfinity/identity";
import { ClientStorageInterface } from "storage";

export const KEY_IDENTITY_KEY = "ARES_IDENTITY_KEY";
export const DELEGATION_CHAINS_KEY = "ARES_DELEGATION_CHAINS_KEY";

export type PersistentDelegationChain = {
  chain: JsonnableDelegationChain;
  provider: string;
};

export type StoredIdentity = {
  identity: Identity;
  provider: string;
};

export type StoredIdentityMap = Map<string, StoredIdentity>;

export class IdentityManager {
  private keyIdentity: Ed25519KeyIdentity = Ed25519KeyIdentity.generate();

  constructor(private storage: ClientStorageInterface) {}

  public async init(): Promise<void> {
    const maybeKeyIdentity = await this.storage.getItem(KEY_IDENTITY_KEY);

    if (maybeKeyIdentity && maybeKeyIdentity !== null) {
      this.keyIdentity = Ed25519KeyIdentity.fromParsedJson(JSON.parse(maybeKeyIdentity));
    } else {
      this.storage.setItem(KEY_IDENTITY_KEY, JSON.stringify(this.keyIdentity.toJSON()));
    }
  }

  public getKeyIdentity(): Ed25519KeyIdentity {
    return this.keyIdentity;
  }

  private async getDelegationChains(): Promise<Map<string, PersistentDelegationChain>> {
    const jsonString = await this.storage.getItem(DELEGATION_CHAINS_KEY);

    if (!jsonString) {
      return new Map();
    }

    return new Map(JSON.parse(jsonString));
  }

  private setDelegationChains(identities: Map<string, PersistentDelegationChain>): Promise<void> {
    return new Promise((resolve) => {
      this.storage.setItem(DELEGATION_CHAINS_KEY, JSON.stringify([...identities]));

      resolve();
    });
  }

  public async getIdentities(): Promise<StoredIdentityMap> {
    const state = await this.getDelegationChains();
    const identities = new Map<string, StoredIdentity>();

    state.forEach((values, principal) => {
      const delegationChain = DelegationChain.fromJSON(values.chain);
      const delegationIdentity = DelegationIdentity.fromDelegation(this.keyIdentity, delegationChain);

      identities.set(principal, {
        identity: delegationIdentity,
        provider: values.provider,
      });
    });

    return identities;
  }

  public async addDelegationChain(chain: DelegationChain, provider: string): Promise<DelegationIdentity> {
    const PersistentDelegationChain: PersistentDelegationChain = {
      chain: chain.toJSON(),
      provider,
    };

    const delegationChains = await this.getDelegationChains();
    const delegationIdentity = DelegationIdentity.fromDelegation(this.keyIdentity, chain);
    const principal = delegationIdentity.getPrincipal();
    delegationChains.set(principal.toString(), PersistentDelegationChain);
    this.setDelegationChains(delegationChains);

    return delegationIdentity;
  }

  public async removeIdentity(identity: Identity): Promise<void> {
    const principal = identity.getPrincipal().toString();
    const state = await this.getDelegationChains();
    state.delete(principal);
    this.setDelegationChains(state);
  }
}
