import { Identity } from "@dfinity/agent";
import React from "react";
import { Button } from "react-native";

import { useClient } from "@bundly/ares-react";

export type LogoutButtonProps = {
  identity: Identity;
  title?: string;
};

export function LogoutButton(props: LogoutButtonProps) {
  const client = useClient();

  async function logout(identity: Identity) {
    try {
      client.removeIdentity(identity);
    } catch (error) {
      throw error;
    }
  }

  return <Button onPress={() => logout(props.identity)} title={props.title || "Logout"} />;
}
