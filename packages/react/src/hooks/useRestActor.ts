import { useContext } from "react";

import { RestClientInstance } from "@bundly/ares-rest";

import { IcpConnectContext } from "../context";

export const useRestActor = (name: string): RestClientInstance => {
  const { client } = useContext(IcpConnectContext);

  const actor = client.getRestActor(name);

  if (!actor) throw new Error("This actor doesn't exist");

  return actor;
};
