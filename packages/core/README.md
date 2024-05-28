# ares-core

A JavaScript frontend library for interacting with ICP Backend Canisters and Identity Providers.

**NOTE: This is a Beta version**

## How to use

To create a Client instance you must call the static method `create` and later you must call the `init` method:

```typescript
const client = Client.create({});
await client.init();
```

### Implement Identity Providers

Most implementations use Identity Providers to call canisters with autenticated identities, so its necesary to declare which Identity Providers you want to use:

```typescript
const client = Client.create({
  providers: [
    new InternetIdentity({
      providerUrl: process.env.NEXT_PUBLIC_INTERNET_IDENTITY_URL!,
    }),
  ],
});
```

See following example to start an authentication process:

```typescript
const provider = client.getProvider("internet-identity");
provider.connect();
```

Then, you can get all the authenticated identities:

```typescript
const identities = client.getIdentities();
```

### Register Canisters

Ares Client supports two kind of Canisters:

- Candid Canisters: Traditional Canisters that you can build according the Internet Computer Protocol
- Http Canisters: Canisters Build according the HTTP Gateway Protocol, **this is an Experimental feature**.

To use candid canisters you can follow the example below:

```typescript

import { _SERVICE, idlFactory } from "path_to_canister_declarations/test.did.js";

export const candidTest: Canister = {
	idlFactory,
	configuration: {
		canisterId: "TEST_CANDID_CANISTER_ID",
	},
};

const client = Client.create({
  agentConfig: {
    host: "IC_HOST_URL",
  },
  ...
  candidCanisters: {
    candidTest
  }
});

const candidActor = client.getCandidActor("candidTest");
```

To use http canisters you can follow the example below:

```typescript
export const httpTest: Canister = {
  baseUrl: "API_REST_URL"
};

const client = Client.create({
  ...
  restCanisters: {
    httpTest
  }
});

const candidActor = client.getRestActor("httpTest");
```

You can use both canisters (candid and http) at the same time:

```typescript
const client = Client.create({
  agentConfig: {
    host: "IC_HOST_URL",
  },
  ...
  candidCanisters: {
    candidTest
  },
  restCanisters: {
    httpTest
  }
});
```

## Advanced features

### Build CustomProviders

Ares defines some prebuild Identity Providers, but if you like to implement your own, you neet to create a class that implements the `IdentityProvider` interface:

```typescript
export class MyCustomIdentityProvider implements IdentityProvider {}
```

For a complete implementation you can see how the `InternetIdentity` provider is built.

### Use Custom Storage

You can define custom storage (where identities and some configurations will be stored), for that, yo need to create a class that implements the `ClientStorageInterface`:

```typescript
class MyCustomStorage implements ClientStorageInterface {}
```
