import { Identity } from "@dfinity/agent";
import { DelegationChain, Ed25519KeyIdentity } from "@dfinity/identity";

export type AuthConnectSuccessPayload = {
  identity: Identity;
  keyIdentity: Ed25519KeyIdentity;
  delegation: DelegationChain;
  provider: string;
  // TODO: we need to send the keyPair as well?
  // keyPair: CryptoKeyPair;
};

export type AuthDisconnectSuccessPayload = {
  identity: Identity;
};

export type AuthConnectErrorPayload = {
  message: string;
};

export type AuthDisconnectErrorPayload = {
  message: string;
};
