import { AnonymousIdentity, Identity } from "@dfinity/agent";
import React, { ReactNode, createContext, useEffect, useState } from "react";

import { Client } from "@bundly/ares-core";

export type IcpConnectContextType = {
  client: Client;
  currentIdentity: Identity;
  isAuthenticated: boolean;
  identities: Identities;
};

export type IcpConnectContextProviderProps = {
  children: ReactNode;
  client: Client;
};

export const IcpConnectContext = createContext<IcpConnectContextType>({} as any);

type Identities = {
  identity: Identity;
  provider: string;
}[];

export const IcpConnectContextProvider = (props: IcpConnectContextProviderProps) => {
  const [initialized, setInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identities, setIdentities] = useState<Identities>([]);
  // Persist the current identity
  const [currentIdentity, setCurrentIdentity] = useState<Identity>(new AnonymousIdentity());
  const [client] = useState<Client>(props.client);

  useEffect(() => {
    bootstrap();
  }, []);

  async function bootstrap() {
    await client.init();
    setListeners(client);

    const storedIdentities = client.getIdentities();
    setIdentities(storedIdentities);
    const identity = storedIdentities[0]?.identity || new AnonymousIdentity();
    const isAuthenticated = !identity.getPrincipal().isAnonymous();

    setCurrentIdentity(identity);
    setIsAuthenticated(isAuthenticated);
    setInitialized(true);
  }

  function setListeners(client: Client) {
    client.eventListener.onIdentityAdded((payload) => {
      setIdentities(client.getIdentities());
      setCurrentIdentity(payload.identity);
      setIsAuthenticated(true);
    });

    client.eventListener.onIdentityRemoved((payload) => {
      const newIdentities = client.getIdentities();

      setIdentities(newIdentities);

      const identity = newIdentities[0]?.identity || new AnonymousIdentity();
      const isAuthenticated = !identity.getPrincipal().isAnonymous();

      setCurrentIdentity(identity);
      setIsAuthenticated(isAuthenticated);
    });
  }

  return (
    initialized && (
      <IcpConnectContext.Provider
        value={{
          client,
          identities,
          currentIdentity,
          isAuthenticated,
        }}>
        {props.children}
      </IcpConnectContext.Provider>
    )
  );
};
