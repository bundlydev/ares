import { Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { DelegationIdentity, Ed25519KeyIdentity, Ed25519PublicKey } from "@dfinity/identity";
import { IncompleteIdentity } from "identity-providers/incomplete-identity";

import { IdentityProvider, InitOptions } from "../identity-provider.interface";
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
  private config: InternetIdentityConfig = defaultConfig;
  private authClient: AuthClient | undefined;
  private options: InitOptions | undefined;
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

  public async init(options: InitOptions): Promise<void> {
    this.options = options;

    this.authClient = await AuthClient.create({
      identity: this.identity,
    });
  }

  public connect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.authClient) {
        this.authClient.login({
          identityProvider: this.config.providerUrl,
          // TODO: allow to set maxTimeToLive from options
          maxTimeToLive: DEFAULT_MAX_TIME_TO_LIVE,
          onSuccess: async () => {
            const identity = this.authClient?.getIdentity();

            if (identity instanceof DelegationIdentity) {
              const delegation = identity.getDelegation();

              this.options?.connect.onSuccess({
                identity,
                keyIdentity: this.keyIdentity,
                delegation,
                provider: this.name,
              });

              resolve();
            }

            reject("Identity is not a DelegationIdentity:");
          },
          onError: (reason) => {
            const message = reason || "Unknown error";

            this.options?.connect.onError({ message });

            reject(reason);
          },
        });
      } else {
        throw new Error("init must be called before this method");
      }
    });
  }

  public async disconnect(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        if (this.authClient) {
          const identity = this.authClient.getIdentity();
          this.options?.disconnect.onSuccess({ identity });
          await this.authClient.logout();
          resolve();
        } else {
          reject("init must be called before this method");
        }
      } catch (error: any) {
        this.options?.disconnect.onError({ message: error.message });
        reject(error);
      }
    });
  }

  public getIdentity(): Identity {
    if (!this.authClient) throw new Error("init must be called before this method");

    return this.authClient?.getIdentity();
  }
}
