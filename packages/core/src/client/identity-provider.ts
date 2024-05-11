import { Identity } from "@dfinity/agent";

import { Client } from "./client";

export const ECDSA_KEY_LABEL = "ECDSA";
export const ED25519_KEY_LABEL = "Ed25519";
export type BaseKeyType = typeof ECDSA_KEY_LABEL | typeof ED25519_KEY_LABEL;

export interface IdentityProvider {
  displayName: string;
  logo: string;
  name: string;
  connect: () => Promise<void>;
  disconnect: (identity: Identity) => Promise<void>;
  init: (client: Client) => Promise<void>;
}
