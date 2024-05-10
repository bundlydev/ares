import { Identity } from "@dfinity/agent";

import { Client } from "../client";

export interface IdentityProvider {
  displayName: string;
  logo: string;
  name: string;
  connect: () => Promise<void>;
  disconnect: (identity: Identity) => Promise<void>;
  init: (client: Client) => Promise<void>;
}
