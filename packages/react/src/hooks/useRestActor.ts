import { Identity } from "@dfinity/agent";
import { useContext } from "react";

import { RestClientInstance } from "@bundly/ares-rest";

import { IcpConnectContext } from "../context";

export const useRestActor = (name: string, identity: Identity): RestClientInstance => {
  const { client } = useContext(IcpConnectContext);

  const actor = client.getRestActor(name, identity);

  return actor;
};
