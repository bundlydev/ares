import { useContext } from "react";

import { Client } from "@bundly/ic-core-js";

import { IcpConnectContext } from "../context";

export const useClient = <T extends Record<string, any>>(): Client<T> => {
  const { client } = useContext(IcpConnectContext);
  return client as Client<T>;
};
