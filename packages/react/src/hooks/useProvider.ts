import { useContext } from "react";

import { IcpConnectContext } from "../context";

export const useProvider = (name: string) => {
  const { client } = useContext(IcpConnectContext);

  return client.getProvider(name);
};
