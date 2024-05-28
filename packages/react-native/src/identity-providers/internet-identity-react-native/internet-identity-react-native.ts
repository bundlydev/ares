import { Identity, SignIdentity, toHex } from "@dfinity/agent";
import { DelegationChain, Ed25519KeyIdentity, isDelegationValid } from "@dfinity/identity";

import { Client, IdentityProvider } from "@bundly/ares-core";

export type AppBrowser = {
  open: (url: string) => void;
  close: () => void;
};

export type InternetIdentityReactNativeConfig = {
  providerUrl: string;
  appLink: string;
  browser: AppBrowser;
};

export type AppLinkParams = {
  delegation: string;
  publicKey: string;
};

export class InternetIdentityReactNative implements IdentityProvider {
  public readonly name = "internet-identity-middleware";
  public readonly displayName = "Internet Identity";
  public readonly logo = "";
  private _key: SignIdentity | null = null;
  private client: Client | undefined;

  constructor(private readonly config: InternetIdentityReactNativeConfig) {}

  public async init(client: Client, keyIdentity: Ed25519KeyIdentity): Promise<void> {
    this.client = client;
    this._key = keyIdentity;
  }

  public async onAppLinkOpened(params: AppLinkParams): Promise<void> {
    const { client, _key } = this;

    if (!client || !_key) throw new Error("init must be called before this method");

    const { delegation, publicKey } = params;

    if (!delegation || !publicKey) {
      throw new Error("delegation or publicKey not set");
    }

    const appHexKey = toHex(_key.getPublicKey().toDer());

    if (appHexKey !== publicKey) throw new Error("key doesn't match");

    const chain = DelegationChain.fromJSON(JSON.parse(decodeURIComponent(delegation)));

    if (!isDelegationValid(chain)) throw new Error("delegation is not valid");

    try {
      client.addDelegationChain(chain, this.name);
    } catch (error) {
      throw error;
    }
  }

  public async connect(): Promise<void> {
    if (!this._key) throw new Error("init must be called before this method");

    try {
      this.config.browser.close();
      const derKey = toHex(this._key.getPublicKey().toDer());

      const url = new URL(this.config.providerUrl);
      url.searchParams.set("redirect_uri", encodeURIComponent(this.config.appLink));
      url.searchParams.set("pubkey", derKey);

      this.config.browser.open(url.toString());
    } catch (error) {
      throw error;
    }
  }

  public async disconnect(identity: Identity): Promise<void> {
    if (!this.client) throw new Error("init must be called before this method");

    return this.client.removeIdentity(identity);
  }
}
