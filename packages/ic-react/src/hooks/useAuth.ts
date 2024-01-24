import { Identity } from "@dfinity/agent";
import { useContext } from "react";

import { IcpConnectContext } from "../context";

export type LoginOptions = {
  maxTimeToLive?: bigint;
  derivationOrigin?: string | URL;
  windowOpenerFeatures?: string;
};

export type Auth = {
  identity: Identity;
  isAuthenticated: boolean;
};

export const useAuth = (): Auth => {
  const { client } = useContext(IcpConnectContext);
  const identity = client.getIdentity();
  const isAuthenticated = !identity.getPrincipal().isAnonymous();

  return {
    identity,
    isAuthenticated,
  };
};
