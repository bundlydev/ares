import { Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { DelegationIdentity, Ed25519KeyIdentity, Ed25519PublicKey } from "@dfinity/identity";
import { IncompleteIdentity } from "identity-providers/incomplete-identity";

import { Client } from "../../client";
import { IdentityProvider } from "../identity-provider.interface";
import { InternetIdentityConfig } from "./internet-identity.types";

const defaultConfig: InternetIdentityConfig = {
  providerUrl: "https://identity.ic0.app",
};

// Set default maxTimeToLive to 8 hours
const DEFAULT_MAX_TIME_TO_LIVE = /* hours */ BigInt(8) * /* nanoseconds */ BigInt(3_600_000_000_000);

export class InternetIdentity implements IdentityProvider {
  public readonly name = "internet-identity";
  public readonly displayName = "Internet Identity";
  // TODO: Add logo svg
  public readonly logo = "";
  private client: Client | undefined;
  private config: InternetIdentityConfig = defaultConfig;
  private authClient: AuthClient | undefined;
  private keyIdentity: Ed25519KeyIdentity;
  private identity: IncompleteIdentity;

  constructor(config: InternetIdentityConfig = {}) {
    this.keyIdentity = Ed25519KeyIdentity.generate();
    const publicKey = this.keyIdentity.getPublicKey();
    this.identity = new IncompleteIdentity(Ed25519PublicKey.fromDer(publicKey.toDer()));
    this.config = {
      ...this.config,
      ...config,
    };
  }

  public async init(client: Client): Promise<void> {
    this.client = client;

    this.authClient = await AuthClient.create({
      identity: this.identity,
    });
  }

  public connect() {
    if (!this.authClient || !this.client) throw new Error("init must be called before this method");

    return new Promise<void>((resolve, reject) => {
      try {
        this.authClient!.login({
          identityProvider: this.config.providerUrl,
          // TODO: allow to set maxTimeToLive from options
          maxTimeToLive: DEFAULT_MAX_TIME_TO_LIVE,
          onSuccess: async () => {
            const identity = this.authClient?.getIdentity();

            if (identity instanceof DelegationIdentity) {
              const delegation = identity.getDelegation();

              await this.client!.addIdentity(delegation, this.keyIdentity, this.name);

              resolve();
            }

            reject("identity is not a DelegationIdentity");
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
