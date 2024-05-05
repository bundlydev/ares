import { useContext } from "react";

import { IcpConnectContext } from "../context";

/**
 * @deprecated The method should not be used, use useCandidActor instead
 */
export const useActor = <T, K extends keyof T = keyof T>(name: K): T[K] => {
  const { client } = useContext(IcpConnectContext);

  const actor = client.getActor(name as string);

  if (!actor) throw new Error("This actor doesn't exist");

  return actor as T[K];
};
