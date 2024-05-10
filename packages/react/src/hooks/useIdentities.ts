import { useContext } from "react";

import { IcpConnectContext } from "../context";

export const useIdentities = () => {
  const { identities } = useContext(IcpConnectContext);

  return identities;
};
