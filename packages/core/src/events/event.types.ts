import { Identity } from "@dfinity/agent";

export type AuthConnectSuccessPayload = {
  identity: Identity;
};

export type AuthConnectErrorPayload = {
  message: string;
};

export type AuthDisconnectErrorPayload = {
  message: string;
};
