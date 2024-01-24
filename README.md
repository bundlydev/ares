# ic-connect-js

Welcome to the `ic-connect-js` monorepo!

## Overview

This repository contains JavaScript connectors designed to establish seamless communication between web and native applications (built with JavaScript) and ICP Backend Services (Canisters).

**Currently, this is a Beta version, but we anticipate releasing our first stable version very soon. Please do not hesitate to send us your comments, questions or suggestions.**

**Contributors are welcome. While we don't have a formal process for proposals, you are encouraged to open an issue at any time before making a pull request.**

## Packages content

1. **ic-core-js**

   Includes :

   - Client class abstracts canister communication.
   - Identity Provider Interface defines the methods that should have all identity providers.
   - Internet Identity Provider is a class that implements authentication with Internet Identity implementing the methods declared in Identity Provider Interface.

2. **ic-react**

   Manages authentication flow with Internet Identity and enables react components to interact with frontend client.

3. **ic-react-native**

   Manages authentication flow of ic-react but for react-native using the Internet Identity middleware.

## How to use

### Canister declarations

In order to use whenever app you are build, you have to create some files to create objects and types needed to work with Canisters

First of all you have to create a file per Canister, the file should look like this:

```javascript
import { ActorSubclass } from "@dfinity/agent";

import { Canister } from "ic-core-js";

// This ignore is required because there's an error with its d.ts file
// @ts-ignore
import { idlFactory } from ".../declarations/user/user.did.js";
import { _SERVICE } from ".../declarations/user/user.did.js";

// Used to type useActor hook
export type UserActor = ActorSubclass<_SERVICE>;

// Used to build Actor
export const user: Canister = {
  idlFactory,
  configuration: {
    canisterId: process.env.USER_CANISTER_ID,
  },
};
```

After you have created all the necessary Canister files, you need to create an index.js file. This file will merge all the canisters into a single object. After creating the `index.js` file, proceed as follows:

```javascript
import { UserActor, user } from "./user";

export type Actors = {
  user: UserActor;
};

export const canisters = {
  user,
};
```

### React App

For React applications, you need to implement our `IcpConnectContextProvider` component in the `App.tsx` file as follows:

```javascript
// App.tsx
...
import { Client, InternetIdentity } from "@bundly/ic-core-js";
import { IcpConnectContextProvider } from "@bundly/ic-react";

import { canisters } from "../canisters";

export default function MyApp({ Component, pageProps }: AppProps) {
  const client = Client.create({
    agent: {
      host: process.env.NEXT_PUBLIC_IC_HOST!,
    },
    canisters,
    providers: [
      new InternetIdentity({
        providerUrl: process.env.INTERNET_IDENTITY_URL
      }),
    ],
  });

  return (
    <IcpConnectContextProvider client={client}>
        <Component {...pageProps} />
    </IcpConnectContextProvider>
  );
}
```

The `providers` attribute in the client object is optional, and currently, we only support a single provider.

To initiate an authentication flow, utilize the `AuthButton`. This button leverages the provided providers to commence a login process.

```javascript
import { AuthButton } from "@bundly/ic-react";

export default function LoginPage() {
  return (
    <div>
      <p>Please login to continue</p>
      <AuthButton />
    </div>
  );
}
```

To establish a connection with a specific Canister, you can utilize the `useActor` hook:

```javascript
import { useActor } from "@bundly/ic-react";

import { Actors } from "../canisters";

const user = useActor<Actors>("user") as Actors["user"];

...
const result = await user.someCanisterMethod()
...
```

We are currently enhancing the way TypeScript infers the correct actor type. In the meantime, you can enforce the type using `as Actors["user"]` as a workaround.

### React Native App

Work in Progress: We are in the process of developing a React Native provider to facilitate Internet Identity authentication on mobile devices.

## Glossary

- **[Internet Computer](https://internetcomputer.org/docs/current/tutorials/hackathon-prep-course/what-is-icp)**: A blockchain-based, decentralized, and permissionless identity system. Internet Identity allows you to authenticate securely and anonymously while you interact with Internet Computer and its dapps.

- **[Canister](https://internetcomputer.org/docs/current/tutorials/hackathon-prep-course/what-is-icp#canister-smart-contracts)**: In the context of the Internet Computer, a canister is a computational unit that can hold both smart contract code and state. Each canister has a unique identifier and can communicate with other canisters through inter-canister calls.

- **[Internet Identity](https://internetcomputer.org/docs/current/developer-docs/integrations/internet-identity/overview)**: A decentralized and distributed computing platform that allows developers to build websites, enterprise IT systems, internet services, and software directly on the public Internet. Developed by DFINITY.

## Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue on the GitHub repository. If you would like to contribute code, please fork the repository and submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
