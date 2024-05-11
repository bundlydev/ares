import type { AppProps } from "next/app";
import "tailwindcss/tailwind.css";

import { Client, InternetIdentity } from "@bundly/ares-core";
import { IcpConnectContextProvider } from "@bundly/ares-react";

export default function MyApp({ Component, pageProps }: AppProps) {
  const client = Client.create({
    providers: [
      new InternetIdentity({
        identityProvider: process.env.NEXT_PUBLIC_INTERNET_IDENTITY_URL!,
      }),
    ],
  });

  return (
    <IcpConnectContextProvider client={client}>
      <Component {...pageProps} />
    </IcpConnectContextProvider>
  );
}
