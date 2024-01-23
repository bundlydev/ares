import { useContext } from "react";

import { AppLinkParams } from "@bundly/ic-core-js";

import { Identity } from "@dfinity/agent";

import { IcpConnectContext } from "../context";

export type LoginOptions = {
  maxTimeToLive?: bigint;
  derivationOrigin?: string | URL;
  windowOpenerFeatures?: string;
};

export type Auth = {
  identity: Identity;
  isAuthenticated: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  onAppLinkOpened: (params: AppLinkParams) => Promise<void>;
};

export const useAuth = (): Auth => {
  const { identity, isAuthenticated, connect, disconnect, onAppLinkOpened } = useContext(IcpConnectContext);

  return {
    identity,
    isAuthenticated,
    connect,
    disconnect,
    onAppLinkOpened,
  };
};
