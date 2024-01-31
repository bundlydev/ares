import { Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";

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
  private client: AuthClient | undefined;
  private options: InitOptions | undefined;

  constructor(config: InternetIdentityConfig = {}) {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  public async init(options: InitOptions): Promise<void> {
    this.client = await AuthClient.create();
    this.options = options;
  }

  public connect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.client) {
        this.client.login({
          identityProvider: this.config.providerUrl,
          onSuccess: async () => {
            const identity = this.client!.getIdentity();
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
        if (this.client) {
          await this.client.logout();
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
    if (!this.client) throw new Error("init must be called before this method");

    return this.client?.getIdentity();
  }
}
