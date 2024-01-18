import { IcpConnectContext, IcpConnectContextType } from "../context";
import { ActorMap } from "@bundly/ic-core-js/client";
import { useContext } from "react";

export const useActor = <T extends Record<string, any>>(name: keyof T): ActorMap<T>[keyof T] => {
  const { client } = useContext(IcpConnectContext) as IcpConnectContextType<T>;

  const actor = client.getActor(name);

  if (!actor) throw new Error("This actor doesn't exist");

  return actor;
};
