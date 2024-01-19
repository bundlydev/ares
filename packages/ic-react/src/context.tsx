import { AnonymousIdentity, Identity } from "@dfinity/agent";
import React, { ReactNode, createContext, useEffect, useState } from "react";

import { AppLinkParams, Client } from "@bundly/ic-core-js";

export type IcpConnectContextType = {
  client: Client;
  identity: Identity;
  isAuthenticated: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  onAppLinkOpened(params: AppLinkParams): Promise<void>;
};

export type IcpConnectContextProviderProps = {
  children: ReactNode;
  client: Client;
};

export const IcpConnectContext = createContext({} as any);

export const IcpConnectContextProvider = ({ children, client }: IcpConnectContextProviderProps) => {
  const [isReady, setIsReady] = useState<boolean>(false);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [identity, setIdentity] = useState<Identity>(new AnonymousIdentity());

  const currentProvider = client.getIdentityProviders()["internet-identity"];

  useEffect(() => {
    async function bootstrap() {
      await currentProvider.init();
      const identity = currentProvider.getIdentity();

      await client.init(identity);

      setIdentity(identity);

      if (!identity.getPrincipal().isAnonymous()) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }

      setIsReady(true);
    }

    bootstrap();
  }, []);

  async function connect() {
    try {
      await currentProvider.connect();

      if (currentProvider.type === "web") {
        const identity = currentProvider.getIdentity();
        await client.replaceIdentity(identity);
        setIdentity(identity);
        setIsAuthenticated(true);
      }
    } catch (error) {
      throw error;
    }
  }

  async function disconnect() {
    await currentProvider.disconnect();
    const identity = new AnonymousIdentity();
    await client.replaceIdentity(identity);
    setIdentity(identity);
    setIsAuthenticated(false);
  }

  async function onAppLinkOpened(params: AppLinkParams) {
    if (currentProvider.type !== "native") {
      console.warn("onAppLinkOpened only should called in native apps");
    }

    if (currentProvider.onAppLinkOpened) {
      await currentProvider.onAppLinkOpened(params);

      const identity = currentProvider.getIdentity();
      await client.replaceIdentity(identity);
      setIdentity(identity);
      setIsAuthenticated(true);
    }
  }

  return (
    isReady && (
      <IcpConnectContext.Provider
        // TODO: useMemo is recommended here
        value={{
          client,
          identity,
          isAuthenticated,
          connect,
          disconnect,
          onAppLinkOpened,
        }}>
        {children}
      </IcpConnectContext.Provider>
    )
  );
};
