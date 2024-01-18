import { IcpConnectContext } from "../context";
import { Identity } from "@dfinity/agent";
import { AppLinkParams } from "icp-connect-core";
import { useContext } from "react";

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
