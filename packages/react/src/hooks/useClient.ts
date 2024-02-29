import { useContext } from "react";

import { Client } from "@bundly/ares-core";

import { IcpConnectContext } from "../context";

export const useClient = (): Client => {
  const { client } = useContext(IcpConnectContext);

  return client;
};
