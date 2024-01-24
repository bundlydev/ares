import React, { ReactNode, createContext, useEffect, useState } from "react";

import { Client } from "@bundly/ic-core-js";

export type IcpConnectContextType = {
  client: Client;
  isAuthenticated: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
};

export type IcpConnectContextProviderProps = {
  children: ReactNode;
  client: Client;
};

export const IcpConnectContext = createContext<IcpConnectContextType>({} as any);

export const IcpConnectContextProvider = (props: IcpConnectContextProviderProps) => {
  const [initialized, setInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [client] = useState<Client>(props.client);

  useEffect(() => {
    async function bootstrap() {
      await client.init();
      const currentProvider = client.getCurrentProvider();

      if (!currentProvider) {
        setIsAuthenticated(false);
        setInitialized(true);
        return;
      }

      const isAuthenticated = !client.getIdentity().getPrincipal().isAnonymous();

      setIsAuthenticated(isAuthenticated);
      setInitialized(true);
    }

    bootstrap();
  }, []);

  async function onConnect() {
    setIsAuthenticated(true);
  }

  async function onDisconnect() {
    setIsAuthenticated(false);
  }

  return (
    initialized && (
      <IcpConnectContext.Provider
        value={{
          client,
          isAuthenticated,
          onConnect,
          onDisconnect,
        }}>
        {props.children}
      </IcpConnectContext.Provider>
    )
  );
};
