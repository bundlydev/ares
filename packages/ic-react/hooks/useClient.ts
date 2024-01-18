import { IcpConnectContext } from "../context";
import { Client } from "icp-connect-core";
import { useContext } from "react";

export const useClient = <T extends Record<string, any>>(): Client<T> => {
  const { client } = useContext(IcpConnectContext);
  return client as Client<T>;
};
