import { Identity, SignIdentity, toHex } from "@dfinity/agent";
import { DelegationChain, Ed25519KeyIdentity, isDelegationValid } from "@dfinity/identity";
// TODO: replace expo-secure-store with another secure storage
import * as SecureStore from "expo-secure-store";

import { Client, IdentityProvider } from "@bundly/ares-core";

import { InternetIdentityReactNativeConfig } from "./internet-identity-react-native.types";

export const KEY_STORAGE_KEY = "identity";

type AppLinkParams = {
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

  public async init(client: Client): Promise<void> {
    const localKey = await this.getKey();
    this.client = client;

    if (localKey) {
      this._key = localKey;
    } else {
      const key = Ed25519KeyIdentity.generate();
      await this.saveKey(key);
    }
  }

  private async getKey(): Promise<Ed25519KeyIdentity | undefined> {
    const storedKey = await SecureStore.getItemAsync(KEY_STORAGE_KEY);

    if (storedKey) return Ed25519KeyIdentity.fromJSON(storedKey);
  }

  private saveKey(key: Ed25519KeyIdentity): Promise<void> {
    this._key = key;
    return SecureStore.setItemAsync(KEY_STORAGE_KEY, JSON.stringify(key));
  }

  public async onAppLinkOpened(params: AppLinkParams): Promise<void> {
    const { delegation, publicKey } = params;

    if (!delegation || !publicKey) {
      throw new Error("delegation or publicKey not set");
    }

    if (!this._key) throw new Error("key not set");

    const derKey = toHex(this._key.getPublicKey().toDer());

    if (derKey !== publicKey) throw new Error("key doesn't match");

    const chain = DelegationChain.fromJSON(JSON.parse(decodeURIComponent(delegation)));

    if (!isDelegationValid(chain)) throw new Error("delegation is not valid");

    try {
      this.client?.addIdentity(this._key, chain, this.name);
    } catch (error) {
      throw error;
    }
  }

  public async connect(): Promise<void> {
    if (!this._key) throw new Error("Key not set");

    try {
      this.config.inAppBrowser.close();

      const derKey = toHex(this._key.getPublicKey().toDer());

      // Open a new window with the IDP provider.
      const url = new URL(this.config.providerUrl);
      url.searchParams.set("redirect_uri", encodeURIComponent(this.config.appLink));

      url.searchParams.set("pubkey", derKey);

      this.config.inAppBrowser.open(url.toString());
    } catch (error) {
      throw error;
    }
  }

  public async disconnect(identity: Identity): Promise<void> {
    if (!this.client) throw new Error("init must be called before this method");

    return this.client.removeIdentity(identity);
  }
}
