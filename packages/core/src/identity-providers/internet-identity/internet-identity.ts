import { Identity } from "@dfinity/agent";
import { AuthClient, AuthClientStorage } from "@dfinity/auth-client";
import { StoredKey } from "@dfinity/auth-client/lib/cjs/storage";
import { DelegationIdentity, Ed25519KeyIdentity, Ed25519PublicKey } from "@dfinity/identity";

import { Client, IncompleteEd25519KeyIdentity } from "../../client";
import { IdentityProvider } from "../../client/identity-provider";
import { InternetIdentityCreateOptions } from "./internet-identity.types";

// Set default maxTimeToLive to 8 hours
const DEFAULT_MAX_TIME_TO_LIVE = /* hours */ BigInt(8) * /* nanoseconds */ BigInt(3_600_000_000_000);

export class TempStorage implements AuthClientStorage {
  private storage = new Map<string, StoredKey>();

  public get(key: string): Promise<StoredKey> {
    const value = this.storage.get(key) as StoredKey;
    return Promise.resolve(value);
  }

  public set(key: string, value: any): Promise<void> {
    this.storage.set(key, value);
    return Promise.resolve();
  }

  public remove(key: string): Promise<void> {
    this.storage.delete(key);
    return Promise.resolve();
  }
}

export class InternetIdentity implements IdentityProvider {
  public readonly name = "internet-identity";
  public readonly displayName = "Internet Identity";
  // TODO: Add logo svg
  public readonly logo = "";
  private client: Client | undefined;
  private authClient: AuthClient | undefined;

  constructor(private readonly config?: InternetIdentityCreateOptions) {}

  public async init(client: Client): Promise<void> {
    this.client = client;
  }

  public async connect() {
    const keyIdentity = Ed25519KeyIdentity.generate();
    const publicKey = Ed25519PublicKey.from(keyIdentity.getPublicKey());
    const incompleteIdentity = new IncompleteEd25519KeyIdentity(publicKey);
    // const storage = new TempStorage();
    const client = await AuthClient.create({
      identity: incompleteIdentity,
    });

    return new Promise<void>((resolve, reject) => {
      try {
        client.login({
          identityProvider: this.config?.identityProvider,
          maxTimeToLive: this.config?.maxTimeToLive || DEFAULT_MAX_TIME_TO_LIVE,
          onSuccess: async () => {
            const clientIdentity = client.getIdentity();

            if (clientIdentity instanceof DelegationIdentity) {
              const delegationChain = clientIdentity.getDelegation();
              this.client?.addIdentity(keyIdentity, delegationChain, this.name);
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
    if (!this.authClient || !this.client) throw new Error("init must be called before this method");

    try {
      await this.authClient.logout();
      this.client.removeIdentity(identity);
    } catch (error) {
      throw error;
    }
  }
}
