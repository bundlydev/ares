import { AnonymousIdentity, Identity, SignIdentity, toHex } from "@dfinity/agent";
import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
  isDelegationValid,
} from "@dfinity/identity";
import { Principal } from "@dfinity/principal";
import AsyncStorage from "@react-native-async-storage/async-storage";
// TODO: replace expo-secure-store with another secure storage
import * as SecureStore from "expo-secure-store";

import { AppLinkParams, IdentityProvider } from "@bundly/ic-core-js";

import { InternetIdentityReactNativeConfig } from "./internet-identity-react-native.types";

export const KEY_STORAGE_KEY = "identity";
export const KEY_STORAGE_DELEGATION = "delegation";

export type StoredKey = string | CryptoKeyPair;

export class InternetIdentityReactNative implements IdentityProvider {
  public readonly name = "internet-identity-middleware";
  public readonly displayName = "Internet Identity";
  public readonly logo = "";
  private _identity: Identity = new AnonymousIdentity();
  private _key: SignIdentity | null = null;
  private _chain: DelegationChain | null = null;

  constructor(private readonly config: InternetIdentityReactNativeConfig) { }

  public async init(): Promise<void> {
    const localKey = await this.getKey();
    const localChain = await this.getChain();

    if (localChain && !isDelegationValid(localChain)) {
      await this.deleteChain();
    }

    if (localKey) {
      this._key = localKey;
      if (localChain && isDelegationValid(localChain)) {
        const identity = DelegationIdentity.fromDelegation(localKey, localChain);
        this._identity = identity;
      }
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

  private async getChain(): Promise<DelegationChain | undefined> {
    const storedDelegation = await AsyncStorage.getItem(KEY_STORAGE_DELEGATION);
    if (storedDelegation) return DelegationChain.fromJSON(JSON.parse(storedDelegation));
  }

  private saveChain(chain: DelegationChain): Promise<void> {
    this._chain = chain;
    return AsyncStorage.setItem(KEY_STORAGE_DELEGATION, JSON.stringify(chain.toJSON()));
  }

  private deleteChain(): Promise<void> {
    return AsyncStorage.removeItem(KEY_STORAGE_DELEGATION);
  }

  public async onAppLinkOpened(params: AppLinkParams): Promise<void> {
    if (!this.getPrincipal().isAnonymous()) return;

    const { delegation, publicKey } = params;

    if (!delegation || !publicKey) {
      throw new Error("delegation or publicKey not set");
    }

    if (!this._key) throw new Error("key not set");

    const derKey = toHex(this._key.getPublicKey().toDer());

    if (derKey !== publicKey) throw new Error("key doesn't match");

    const chain = DelegationChain.fromJSON(JSON.parse(decodeURIComponent(delegation)));

    if (!isDelegationValid(chain)) throw new Error("delegation is not valid");

    await this.saveChain(chain);

    const identity: DelegationIdentity = DelegationIdentity.fromDelegation(this._key, this._chain!);

    this._identity = identity;

    this.config.inAppBrowser.close();
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

  public async disconnect(): Promise<void> {
    await this.deleteChain();
    this._identity = new AnonymousIdentity();
    this._chain = null;
  }

  public isAuthenticated(): boolean {
    return !this.getPrincipal().isAnonymous();
  }

  public getIdentity(): Identity {
    return this._identity;
  }

  public getPrincipal(): Principal {
    return this._identity.getPrincipal();
  }
}
