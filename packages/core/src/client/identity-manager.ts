import { Identity, SignIdentity, toHex } from "@dfinity/agent";
import { DelegationChain, Ed25519KeyIdentity, PartialIdentity } from "@dfinity/identity";
import { ClientStorageInterface } from "storage";

export const KEY_STORED_IDENTITIES = "STORED_IDENTITIES_KEY";

export type PersistentIdentity = {
  identity: {
    // DerEncodedPublicKey to hex
    publicKey: string;
    // ArrayBuffer to hex
    secretKey: string;
  };
  delegation: DelegationChain;
  provider: string;
};

export type StoredIdentity = {
  identity: Identity;
  provider: string;
};

export class IdentityManager {
  constructor(private storage: ClientStorageInterface) {}

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
      const publicKey = values.identity.publicKey;
      const secretKey = values.identity.secretKey;
      const identity = Ed25519KeyIdentity.fromParsedJson([publicKey, secretKey]);

      identities.set(principal, {
        identity,
        provider: values.provider,
      });
    });

    return identities;
  }

  private async getState(): Promise<Map<string, PersistentIdentity>> {
    const jsonString = await this.storage.getItem(KEY_STORED_IDENTITIES);

    if (!jsonString) {
      return new Map();
    }

    const regex = /(^"|"$)|\\+/g;
    const jsonStringCleaned = jsonString.replace(regex, "");
    const array = JSON.parse(jsonStringCleaned);

    return new Map(array);
  }

  public async persist(
    keyIdentity: SignIdentity | PartialIdentity,
    delegationChain: DelegationChain,
    provider: string
  ): Promise<void> {
    if (!(keyIdentity instanceof Ed25519KeyIdentity)) {
      throw new Error("Unsupported identity type");
    }

    const principal = keyIdentity.getPrincipal().toString();

    const PersistentIdentity: PersistentIdentity = {
      identity: {
        publicKey: toHex(keyIdentity.getKeyPair().publicKey.toDer()),
        secretKey: toHex(keyIdentity.getKeyPair().secretKey),
      },
      delegation: delegationChain,
      provider,
    };

    const state = await this.getState();
    state.set(principal, PersistentIdentity);
    this.setState(state);
  }

  public async remove(identity: Identity): Promise<void> {
    const principal = identity.getPrincipal().toString();
    const state = await this.getState();
    state.delete(principal);
    this.setState(state);
  }
}
