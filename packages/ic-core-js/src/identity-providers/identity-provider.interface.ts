import { Identity } from "@dfinity/agent";

import { AuthConnectErrorPayload, AuthConnectSuccessPayload, AuthDisconnectErrorPayload } from "../events";

export type AppLinkParams = {
  publicKey: string;
  delegation: string;
};

export type InitOptions = {
  connect: {
    onSuccess: (payload: AuthConnectSuccessPayload) => void;
    onError: (error: AuthConnectErrorPayload) => void;
  };
  disconnect: {
    onSuccess: () => void;
    onError: (error: AuthDisconnectErrorPayload) => void;
  };
};

export interface IdentityProvider {
  name: string;
  displayName: string;
  logo: string;
  init: (options: InitOptions) => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  getIdentity: () => Identity;
  // TODO: This is mandatory for native apps
  onAppLinkOpened?: (params: AppLinkParams) => Promise<void>;
}
