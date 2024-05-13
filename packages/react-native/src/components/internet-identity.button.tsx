import React from "react";
import { Button } from "react-native";

import { useClient, useProvider } from "@bundly/ares-react";

export type LoginButtonProps = {
  title?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
};

export function InternetIdentityButton(props: LoginButtonProps) {
  const provider = useProvider("internet-identity");
  const client = useClient();

  async function login() {
    try {
      await provider.connect();
      props.onSuccess?.();
    } catch (error: any) {
      props.onError?.(error);
    }
  }

  return <Button onPress={() => login()} title={props.title || "Login"} />;
}
