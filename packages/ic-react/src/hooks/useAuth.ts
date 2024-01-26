import { Identity } from "@dfinity/agent";
import { useContext } from "react";

import { IcpConnectContext } from "../context";

export type Auth = {
  identity: Identity;
  isAuthenticated: boolean;
};

export const useAuth = (): Auth => {
  const { isAuthenticated, identity } = useContext(IcpConnectContext);

  return {
    identity,
    isAuthenticated,
  };
};
