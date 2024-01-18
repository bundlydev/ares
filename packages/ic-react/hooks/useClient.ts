import { IcpConnectContext } from "../context";
import { Client } from "@bundly/ic-core-js";
import { useContext } from "react";

export const useClient = <T extends Record<string, any>>(): Client<T> => {
  const { client } = useContext(IcpConnectContext);
  return client as Client<T>;
};
