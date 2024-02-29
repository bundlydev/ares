# ares-core

A JavaScript library for interacting with the Internet Computer (IC).

## How to use

Define your Candid Canisters

```javascript
export const cc: Canister = {
	idlFactory,
	configuration: {
		canisterId: "YOUR_CANDID_CANISTER_ID",
	},
};

export const candidCanisters = {
  cc
};
```

Define your Rest Canisters

```javascript
export const rc: Canister = {
  baseUrl: "YOUR_API_REST_URL"
};

export const restCanisters = {
  rc
};
```

Create a new client

```javascript
const client = Client.create({
  agent: {
    host: "YOUR_IC_HOST_URL",
  },
  candidCanisters,
  restCanisters,
  providers: [
    new InternetIdentity({
      providerUrl: process.env.INTERNET_IDENTITY_URL,
    }),
  ],
});
```

Initialize your client

```javascript
await client.init();
```

## Available Methods

### Replace Identity

```javascript
import { Identity } from '@dfinity/agent';

const identity: Identity = yourIdentity;

await client.replaceIdentity(identity);
```

### Get current Identity

```javascript
const identity = client.getIdentity();
```

### Get Candid Actor

```javascript
const candidActor = client.getCandidActor("CANDID_ACTOR_NAME");
```

### Get Rest Actor

```javascript
const candidActor = client.getRestActor("REST_ACTOR_NAME");
```
