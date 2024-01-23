import { useContext } from "react";

import { ActorMap } from "@bundly/ic-core-js/client";

import { IcpConnectContext, IcpConnectContextType } from "../context";

export const useActor = <T extends Record<string, any>>(name: keyof T): ActorMap<T>[keyof T] => {
  const { client } = useContext(IcpConnectContext) as IcpConnectContextType<T>;

  const actor = client.getActor(name);

  if (!actor) throw new Error("This actor doesn't exist");

  return actor;
};
