import { Identity } from "@dfinity/agent";
import { useContext } from "react";

import { IcpConnectContext } from "../context";

export type Auth = {
  identity: Identity;
  isAuthenticated: boolean;
};

export const useAuth = (): Auth => {
  const { client, isAuthenticated } = useContext(IcpConnectContext);
  const identity = client.getIdentity();

  return {
    identity,
    isAuthenticated,
  };
};
