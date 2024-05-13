import { Ed25519KeyIdentity } from "@dfinity/identity";

import { Client } from "./client";

export const ECDSA_KEY_LABEL = "ECDSA";
export const ED25519_KEY_LABEL = "Ed25519";
export type BaseKeyType = typeof ECDSA_KEY_LABEL | typeof ED25519_KEY_LABEL;

export interface IdentityProvider {
  name: string;
  displayName: string;
  logo: string;
  init: (client: Client, keyIdentity: Ed25519KeyIdentity) => Promise<void>;
  connect: () => Promise<void>;
  disconnect: (identity: Ed25519KeyIdentity) => Promise<void>;
}
