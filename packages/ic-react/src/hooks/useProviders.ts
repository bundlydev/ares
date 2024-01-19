import { useContext } from "react";

import { IcpConnectContext } from "../context";

export const useProviders = () => {
  const { client } = useContext(IcpConnectContext);

  return client.getIdentityProviders();
};
