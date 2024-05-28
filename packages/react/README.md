# ares-react

`ares-core` wrapper for React applications and provides a components for ease of use.

**NOTE: This is a Beta version**

## How to use

The following example shows the basic usage:

```tsx
const client = Client.create({
  // Client configurations, see Ares Core Readme
});

return (
  <IcpConnectContextProvider client={client}>
    <App />
  </IcpConnectContextProvider>
);
```

### Authentication

To login you can use prebuild authentication buttons:

```tsx
<InternetIdentityButton />
```

Or you can build your own:

```tsx
function onLogin() {
  const provider = client.getProvider("internet-identity");
  provider.connect();
}

<button onClick={onLogin}>Login<button/>
```

To manage authentication, we provide the `useAuth` hook, it contains three attributes:

```tsx
/**
 * isAuthenticated: boolean
 * currentIdentity: Identity
 * changeCurrentIdenty: (identity: Identity) => void
 */
const { isAuthenticated, currentIdentity, changeCurrentIdentity } = useAuth();
```

To logout use the `LogoutButton`, yo need to specify which identity you want to logout, in the example we are going to logut the current identity:

```tsx
const {currentIdentity} = useAuth();
<LogoutButton identity={currentIdentity}>
```

### Connect to Candid Actors

You can easily access the candid canisters declared in the `Client`.

In order to get the correct types for the selected Actor, you need to create a type:

```tsx
import { _SERVICE } from "PATH_TO_CANISTER_DECLARATIONS/test.did.js";

export type CandidActors = {
  test: ActorSubclass<_SERVICE>;
};
```

You can now select the actor you want to interact with:

```tsx
const test = useCandidActor<CandidActors>("test", identity) as CandidActors["test"];

const result = await test.someMethod();
```

**NOTE: We are working to improve this**

If you are working with Actor Classes, you can pass a third argument specifying the canisterId:

```tsx
const test = useCandidActor<CandidActors>("test", identity, {
  canisterId: "CANISTER_ID_CREATED_ON_THE_FLY",
}) as CandidActors["test"];
```

For this type of canisters can be defined in the client as follows (with an empty canisterId):

```typescript
export const candidTest: Canister = {
  idlFactory,
  configuration: {
    canisterId: "",
  },
};
```

### Connect to Http Actors

You can easily access the http canisters declared in the `Client`, as follows:

```tsx
const backend = useRestActor("backend", identity);

const getResponse = backend.get("/some-url");
const postResponse = backend.post("/some-url", data);
```

**NOTE: Ares Rest doesn't support multipart/form-data**
