import { Identity } from "@dfinity/agent";
import { useContext } from "react";

import { IcpConnectContext } from "../context";

export type Auth = {
  currentIdentity: Identity;
  isAuthenticated: boolean;
  changeCurrentIdentity: (identity: Identity) => void;
};

export const useAuth = (): Auth => {
  const { isAuthenticated, currentIdentity, changeCurrentIdentity } = useContext(IcpConnectContext);

  return {
    currentIdentity,
    isAuthenticated,
    changeCurrentIdentity,
  };
};
