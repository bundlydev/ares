import { Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { DelegationIdentity } from "@dfinity/identity";

import { IdentityProvider, InitOptions } from "../identity-provider.interface";
import { InternetIdentityConfig } from "./internet-identity.types";

const defaultConfig: InternetIdentityConfig = {
  providerUrl: "https://identity.ic0.app",
};

export class InternetIdentity implements IdentityProvider {
  public readonly name = "internet-identity";
  public readonly displayName = "Internet Identity";
  // TODO: Add logo svg
  public readonly logo = "";
  private config: InternetIdentityConfig = defaultConfig;
  private authClient: AuthClient | undefined;
  private options: InitOptions | undefined;

  constructor(config: InternetIdentityConfig = {}) {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  public async init(options: InitOptions): Promise<void> {
    this.authClient = await AuthClient.create();
    this.options = options;
  }

  public connect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.authClient) {
        this.authClient.login({
          identityProvider: this.config.providerUrl,
          onSuccess: async () => {
            const identity = this.authClient!.getIdentity();

            if (identity instanceof DelegationIdentity) {
              const principal = identity.getPrincipal();
              const publicKey = identity.getPublicKey();
              const delegation = identity.getDelegation();

              console.log("Principal:", principal);
              console.log("Public Key:", publicKey);
              console.log("Delegation:", delegation);
            }

            this.options?.connect.onSuccess({ identity });
            resolve();
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
          await this.authClient.logout();
          this.options?.disconnect.onSuccess();
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
