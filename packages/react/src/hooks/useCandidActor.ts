import { useContext } from "react";

import { GetCandidActorOptions } from "@bundly/ares-core";

import { IcpConnectContext } from "../context";

export const useCandidActor = <T, K extends keyof T = keyof T>(
  name: K,
  options: GetCandidActorOptions
): T[K] => {
  const { client } = useContext(IcpConnectContext);

  const actor = client.getCandidActor(name as string, options);

  if (!actor) throw new Error("This actor doesn't exist");

  return actor as T[K];
};
