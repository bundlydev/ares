import { useContext } from "react";

import { IdentityProvider } from "@bundly/ic-core-js";

import { IcpConnectContext } from "../context";

export const useCurrentProvider = (): IdentityProvider | undefined => {
  const { client } = useContext(IcpConnectContext);

  return client.getCurrentProvider();
};
