import React from "react";
import { Button } from "react-native";

import { IdentityProvider } from "@bundly/ic-core-js";
import { useAuth, useClient, useCurrentProvider, useProviders } from "@bundly/ic-react";

export type AuthButtonProps = {
  login?: {
    text?: string;
  };
};

export function AuthButton(props: AuthButtonProps) {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <LogoutButton /> : <LoginButton />;
}

export type LoginButtonProps = {
  title?: string;
};

function LoginButton(props: LoginButtonProps) {
  const client = useClient();
  const providers = useProviders();

  async function login() {
    try {
      const provider = selectProvider(providers);

      await client.setCurrentProvider(provider.name);

      await provider.connect();
    } catch (error) {
      await client.removeCurrentProvider();
    }
  }

  return <Button onPress={() => login()} title={props.title || "Login"} />;
}

export type LogoutButtonProps = {
  title?: string;
};

function LogoutButton(props: LogoutButtonProps) {
  const client = useClient();
  const provider = useCurrentProvider();

  async function logout() {
    if (!provider) {
      throw new Error("No identity provider selected");
    }

    try {
      await provider.disconnect();
      await client.removeCurrentProvider();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  return <Button onPress={() => logout()} title={props.title || "Logout"} />;
}

function selectProvider(providers: IdentityProvider[]): IdentityProvider {
  if (providers.length === 0) {
    throw new Error("No providers available");
  }

  if (providers.length === 1) {
    return providers[0];
  }

  // TODO: Display view to select provider
  return providers[0];
}
