import { Identity } from "@dfinity/agent";
import { AuthClient, AuthClientStorage } from "@dfinity/auth-client";
import { StoredKey } from "@dfinity/auth-client/lib/cjs/storage";
import { DelegationIdentity, Ed25519KeyIdentity, Ed25519PublicKey } from "@dfinity/identity";

import { Client } from "../../client";
import { IdentityProvider } from "../identity-provider";
import { IncompleteEd25519KeyIdentity } from "../incomplete-ed25519-key-identity";

export type InternetIdentityCreateOptions = {
  providerUrl?: string;
  maxTimeToLive?: bigint;
};

// Set default maxTimeToLive to 8 hours
const DEFAULT_MAX_TIME_TO_LIVE = /* hours */ BigInt(8) * /* nanoseconds */ BigInt(3_600_000_000_000);

export class EmptyStorage implements AuthClientStorage {
  public get(key: string): Promise<StoredKey> {
    return Promise.resolve("");
  }

  public set(key: string, value: any): Promise<void> {
    return Promise.resolve();
  }

  public remove(key: string): Promise<void> {
    return Promise.resolve();
  }
}

export class InternetIdentity implements IdentityProvider {
  public readonly name = "internet-identity";
  public readonly displayName = "Internet Identity";
  // TODO: Add svg logo
  public readonly logo = "";
  private client: Client | undefined;
  private keyIdentity: Ed25519KeyIdentity | undefined;

  constructor(private readonly config?: InternetIdentityCreateOptions) {}

  public async init(client: Client, keyIdentity: Ed25519KeyIdentity): Promise<void> {
    this.client = client;
    this.keyIdentity = keyIdentity;
  }

  public async connect() {
    const { client, keyIdentity } = this;

    if (!client || !keyIdentity) throw new Error("init must be called before this method");

    const publicKey = Ed25519PublicKey.from(keyIdentity.getPublicKey());
    const incompleteIdentity = new IncompleteEd25519KeyIdentity(publicKey);
    const storage = new EmptyStorage();
    const authClient = await AuthClient.create({
      identity: incompleteIdentity,
      storage,
    });

    return new Promise<void>((resolve, reject) => {
      try {
        authClient.login({
          identityProvider: this.config?.providerUrl,
          maxTimeToLive: this.config?.maxTimeToLive || DEFAULT_MAX_TIME_TO_LIVE,
          onSuccess: async () => {
            const authClientIdentity = authClient.getIdentity();

            if (authClientIdentity instanceof DelegationIdentity) {
              const delegationChain = authClientIdentity.getDelegation();
              client.addDelegationChain(delegationChain, this.name);
              resolve();
            }

            reject(new Error("Invalid delegation identity instance"));
          },
          onError: (reason) => {
            reject(new Error(reason));
          },
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  public async disconnect(identity: Identity): Promise<void> {
    if (!this.client) throw new Error("init must be called before this method");

    try {
      this.client.removeIdentity(identity);
    } catch (error) {
      throw error;
    }
  }
}
