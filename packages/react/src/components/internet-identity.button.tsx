import { useClient, useProvider } from "hooks";
import React, { CSSProperties } from "react";

export type InternetIdentityButtonProps = {
  children?: React.ReactNode;
  style?: CSSProperties;
  onSuccess?: () => void;
  onError?: (error: any) => void;
};

export function InternetIdentityButton(props: InternetIdentityButtonProps) {
  const provider = useProvider("internet-identity");
  const client = useClient();

  async function login() {
    await provider.init(client);

    try {
      await provider.connect();
      props.onSuccess?.();
    } catch (error: any) {
      props.onError?.(error);
    }
  }

  return (
    <button onClick={() => login()} style={props.style || styles.button}>
      {props.children || "Login with Internet Identity"}
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
