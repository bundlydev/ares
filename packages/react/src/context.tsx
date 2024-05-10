import { AnonymousIdentity, Identity } from "@dfinity/agent";
import React, { ReactNode, createContext, useEffect, useState } from "react";

import { Client } from "@bundly/ares-core";

export type IcpConnectContextType = {
  client: Client;
  identity: Identity;
  isAuthenticated: boolean;
};

export type IcpConnectContextProviderProps = {
  children: ReactNode;
  client: Client;
};

export const IcpConnectContext = createContext<IcpConnectContextType>({} as any);

export const IcpConnectContextProvider = (props: IcpConnectContextProviderProps) => {
  const [initialized, setInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identity, setIdentity] = useState<Identity>(new AnonymousIdentity());
  const [client] = useState<Client>(props.client);

  useEffect(() => {
    bootstrap();
  }, []);

  async function bootstrap() {
    await client.init();
    setListeners(client);

    const currentProvider = client.getCurrentProvider();

    if (!currentProvider) {
      setAnonymousIdentity();
      setInitialized(true);
      return;
    }

    // TODO: get this from state or take the first one or set it to anonymous
    const identity = client.getIdentities()[0]?.identity || new AnonymousIdentity();
    const isAuthenticated = !identity.getPrincipal().isAnonymous();

    setIdentity(identity);
    setIsAuthenticated(isAuthenticated);
    setInitialized(true);
  }

  function setListeners(client: Client) {
    // TODO: Maybe these listeners should be moved to the client
    client.eventListener.connectSuccess((payload) => {
      setIdentity(payload.identity);
      setIsAuthenticated(true);
    });

    client.eventListener.disconnectSuccess(() => {
      setAnonymousIdentity();
    });
  }

  function setAnonymousIdentity() {
    const anonymousIdentity = new AnonymousIdentity();
    setIdentity(anonymousIdentity);
    setIsAuthenticated(false);
  }

  return (
    initialized && (
      <IcpConnectContext.Provider
        value={{
          client,
          identity,
          isAuthenticated,
        }}>
        {props.children}
      </IcpConnectContext.Provider>
    )
  );
};
