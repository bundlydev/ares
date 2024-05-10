import { Identity } from "@dfinity/agent";
import { useContext } from "react";

import { IcpConnectContext } from "../context";

export type Auth = {
  currentIdentity: Identity;
  isAuthenticated: boolean;
};

export const useAuth = (): Auth => {
  const { isAuthenticated, currentIdentity } = useContext(IcpConnectContext);

  return {
    currentIdentity,
    isAuthenticated,
  };
};
