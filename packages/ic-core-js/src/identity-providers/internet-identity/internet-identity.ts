import { Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";

import { ConnectError } from "../../errors/connect.error";
import { IdentityProvider } from "../identity-provider.interface";
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

  constructor(config: InternetIdentityConfig = {}) {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  public async init(): Promise<void> {
    this.client = await AuthClient.create();
  }

  public connect(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.client) {
        this.client.login({
          identityProvider: this.config.providerUrl,
          onSuccess: async () => {
            resolve();
          },
          onError: (reason) => {
            throw new ConnectError(reason);
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
        } else {
          throw new Error("init must be called before this method");
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  public getIdentity(): Identity {
    if (!this.client) throw new Error("init must be called before this method");

    return this.client?.getIdentity();
  }
}
