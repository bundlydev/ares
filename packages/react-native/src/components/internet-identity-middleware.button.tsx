import React from "react";
import { Button, Linking } from "react-native";

import { useProvider } from "@bundly/ares-react";

import { InternetIdentityReactNative } from "../identity-providers";

const DELEGATE_SEARCH_PARAM_KEY = "delegation";
const PUBLIC_KEY_SEARCH_PARAM_KEY = "publicKey";

export type LoginButtonProps = {
  title?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
};

export function InternetIdentityMidlewareButton(props: LoginButtonProps) {
  const provider = useProvider("internet-identity-middleware") as InternetIdentityReactNative;

  async function login() {
    try {
      await provider.connect();

      const subscription = urlSubscription((event) => {
        const url = new URL(event);
        const delegation = url.searchParams.get(DELEGATE_SEARCH_PARAM_KEY);
        const publicKey = url.searchParams.get(PUBLIC_KEY_SEARCH_PARAM_KEY);

        if (delegation && publicKey) {
          provider.onAppLinkOpened({
            delegation,
            publicKey,
          });

          props.onSuccess?.();
        } else {
          props.onError?.(
            `${DELEGATE_SEARCH_PARAM_KEY} or ${PUBLIC_KEY_SEARCH_PARAM_KEY} not found in the URL.`
          );
        }

        subscription.remove();
      });
    } catch (error: any) {
      props.onError?.(error);
    }
  }

  return <Button onPress={() => login()} title={props.title || "Login"} />;
}

function urlSubscription(listener: (url: string) => void) {
  const onReceiveURL = (event: { url: string }) => listener(event.url);

  const urlChangeSubscription = Linking.addEventListener("url", onReceiveURL);

  return urlChangeSubscription;
}
