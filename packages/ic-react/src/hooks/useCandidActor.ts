import { useContext } from "react";

import { IcpConnectContext } from "../context";

export const useCandidActor = <T, K extends keyof T = keyof T>(name: K): T[K] => {
  const { client } = useContext(IcpConnectContext);

  const actor = client.getCandidActor(name as string);

  if (!actor) throw new Error("This actor doesn't exist");

  return actor as T[K];
};
