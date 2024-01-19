import { useContext } from "react";

import { IcpConnectContext } from "../context";

export const useActor = <T, K extends keyof T = keyof T>(name: K): T[K] => {
  const { client } = useContext(IcpConnectContext);

  const actor = client.getActor(name);

  if (!actor) throw new Error("This actor doesn't exist");

  return actor;
};
