import { ConnectError } from "../../errors/connect.error";
import { IdentityProvider } from "../identity-provider.interface";
import { InternetIdentityConfig } from "./internet-identity.types";
import { AnonymousIdentity, Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { Principal } from "@dfinity/principal";

const defaultConfig: InternetIdentityConfig = {
  providerUrl: "https://identity.ic0.app",
};

export class InternetIdentity implements IdentityProvider {
  public readonly type = "web";
  private name = "Internet Identity";
  private config: InternetIdentityConfig = defaultConfig;
  private client!: AuthClient;
  private isAuth: boolean = false;
  private identity: Identity = new AnonymousIdentity();
  private principal: Principal = this.identity.getPrincipal();

  constructor(config: InternetIdentityConfig = {}) {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  public async init(): Promise<void> {
    this.client = await AuthClient.create();
    this.isAuth = await this.client.isAuthenticated();
    this.identity = this.client.getIdentity();
    this.principal = this.identity?.getPrincipal();
  }

  private async setData(): Promise<void> {
    if (!this.client) throw new Error("init must be called before this method");

    try {
      this.isAuth = await this.client.isAuthenticated();
      this.identity = this.client.getIdentity();
      this.principal = this.identity?.getPrincipal();
    } catch (error) {
      throw error;
    }
  }

  public connect(): Promise<void> {
    if (!this.client) throw new Error("init must be called before this method");

    return new Promise<void>((resolve) => {
      this.client.login({
        identityProvider: this.config.providerUrl,
        onSuccess: async () => {
          await this.setData();
          resolve();
        },
        onError: (reason) => {
          throw new ConnectError(reason);
        },
      });
    });
  }

  public async disconnect(): Promise<void> {
    if (!this.client) throw new Error("init must be called before this method");

    return new Promise<void>(async (resolve, reject) => {
      try {
        await this.client.logout();
        await this.setData();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  public isAuthenticated(): boolean {
    if (!this.client) throw new Error("init must be called before this method");

    return this.isAuth;
  }

  public getIdentity(): Identity {
    if (!this.client) throw new Error("init must be called before this method");

    return this.identity;
  }

  public getPrincipal(): Principal {
    if (!this.client) throw new Error("init must be called before this method");

    return this.principal;
  }
}
