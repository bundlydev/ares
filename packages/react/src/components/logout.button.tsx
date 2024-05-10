import { Identity } from "@dfinity/agent";
import React, { CSSProperties } from "react";

import { useClient } from "../hooks";

export type LogoutButtonProps = {
  identity: Identity;
  children?: React.ReactNode;
  style?: CSSProperties;
};

export function LogoutButton(props: LogoutButtonProps) {
  const client = useClient();

  async function logout(identity: Identity) {
    try {
      client.removeIdentity(identity);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  return (
    <button onClick={() => logout(props.identity)} style={props.style || styles.button}>
      {props.children || "Logout"}
    </button>
  );
}

const styles = {
  button: {
    backgroundColor: "white",
    color: "black",
    padding: "8px 16px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s ease-in-out",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
};
