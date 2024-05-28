import { Identity } from "@dfinity/agent";
import { useContext } from "react";

import { GetCandidActorOptions } from "@bundly/ares-core";

import { IcpConnectContext } from "../context";

export const useCandidActor = <T, K extends keyof T = keyof T>(
  name: K,
  identity: Identity,
  options?: GetCandidActorOptions
): T[K] => {
  const { client } = useContext(IcpConnectContext);

  const actor = client.getCandidActor(name as string, identity, options);

  return actor as T[K];
};
