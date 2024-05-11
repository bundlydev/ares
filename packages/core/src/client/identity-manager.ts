import { Identity, SignIdentity } from "@dfinity/agent";
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
  JsonnableDelegationChain,
} from "@dfinity/identity";
import { JsonnableEd25519KeyIdentity } from "@dfinity/identity/lib/cjs/identity/ed25519";
import { ClientStorageInterface } from "storage";

export const KEY_STORED_IDENTITIES = "STORED_IDENTITIES_KEY";

export type PersistentIdentity = {
  identity: JsonnableEd25519KeyIdentity;
  delegation: JsonnableDelegationChain;
  provider: string;
};

export type StoredIdentity = {
  identity: Identity;
  provider: string;
};

export class IdentityManager {
  constructor(private storage: ClientStorageInterface) {}

  private async getState(): Promise<Map<string, PersistentIdentity>> {
    const jsonString = await this.storage.getItem(KEY_STORED_IDENTITIES);

    if (!jsonString) {
      return new Map();
    }

    return new Map(JSON.parse(jsonString));
  }

  public setState(identities: Map<string, PersistentIdentity>): Promise<void> {
    return new Promise((resolve) => {
      this.storage.setItem(KEY_STORED_IDENTITIES, JSON.stringify([...identities]));

      resolve();
    });
  }

  public async getAll(): Promise<Map<string, StoredIdentity>> {
    const state = await this.getState();
    const identities = new Map<string, StoredIdentity>();

    state.forEach((values, principal) => {
      const keyIdentity = Ed25519KeyIdentity.fromParsedJson(values.identity);
      const delegationChain = DelegationChain.fromJSON(values.delegation);
      const delegationIdentity = DelegationIdentity.fromDelegation(keyIdentity, delegationChain);

      identities.set(principal, {
        identity: delegationIdentity,
        provider: values.provider,
      });
    });

    return identities;
  }

  public async persist(
    identity: SignIdentity,
    delegationChain: DelegationChain,
    provider: string
  ): Promise<DelegationIdentity> {
    if (!(identity instanceof Ed25519KeyIdentity)) {
      throw new Error("Ed25519KeyIdentity is only supported for now");
    }

    const delegationIdentity = DelegationIdentity.fromDelegation(identity, delegationChain);

    const principal = delegationIdentity.getPrincipal();

    const PersistentIdentity: PersistentIdentity = {
      identity: identity.toJSON(),
      delegation: delegationChain.toJSON(),
      provider,
    };

    const state = await this.getState();
    state.set(principal.toString(), PersistentIdentity);
    this.setState(state);

    return delegationIdentity;
  }

  public async remove(identity: Identity): Promise<void> {
    const principal = identity.getPrincipal().toString();
    const state = await this.getState();
    state.delete(principal);
    this.setState(state);
  }
}
