import { SignIdentity } from "@dfinity/agent";
import { IdleOptions } from "@dfinity/auth-client";
import { AuthClientStorage } from "@dfinity/auth-client/lib/cjs/storage";

import { BaseKeyType } from "../internet-provider.constants";

export type ConnectOptions = {
  /**
   * An {@link Identity} to use as the base.
   *  By default, a new {@link AnonymousIdentity}
   */
  identity?: SignIdentity;
  /**
   * {@link AuthClientStorage}
   * @description Optional storage with get, set, and remove. Uses {@link IdbStorage} by default
   */
  storage?: AuthClientStorage;
  /**
   * type to use for the base key
   * @default 'ECDSA'
   * If you are using a custom storage provider that does not support CryptoKey storage,
   * you should use 'Ed25519' as the key type, as it can serialize to a string
   */
  keyType?: BaseKeyType;
  /**
   * Options to handle idle timeouts
   * @default after 10 minutes, invalidates the identity
   */
  idleOptions?: IdleOptions;
};

export type InternetIdentityCreateOptions = {
  /**
   * An {@link Identity} to use as the base.
   *  By default, a new {@link AnonymousIdentity}
   */
  identity?: SignIdentity;
  /**
   * {@link AuthClientStorage}
   * @description Optional storage with get, set, and remove. Uses {@link IdbStorage} by default
   */
  storage?: AuthClientStorage;
  /**
   * type to use for the base key
   * @default 'ECDSA'
   * If you are using a custom storage provider that does not support CryptoKey storage,
   * you should use 'Ed25519' as the key type, as it can serialize to a string
   */
  keyType?: BaseKeyType;
  /**
   * Options to handle idle timeouts
   * @default after 10 minutes, invalidates the identity
   */
  idleOptions?: IdleOptions;
};

export type InternetIdentityConfig = {
  providerUrl?: string;
} & InternetIdentityCreateOptions;
