# ares-react-native

Provides Internet Identity Middleware provider and Auth Buttons to enable the Internet Identity integration for React Native Apps.

**NOTE: This is a Beta version**

## How to use

Since Ares React Native depends on React Native, you must first implement Ares Core and Ares React. You can see how to do this in their README.md files.

To use Ares React Native, you must import `ReactNativeStorage`:

```typescript
import { ReactNativeStorage } from "@bundly/ares-react-native";

const client = Client.create({
  agentConfig: {
    host: EXPO_PUBLIC_IC_HOST_URL,
  },
  candidCanisters,
  storage: new ReactNativeStorage(),
});
```

Maybe you need to add some polyfills, here we provide a base shim.js file that you can use and customize:

```javascript
// import { polyfill as polyfillBase64 } from "react-native-polyfill-globals/src/base64";
import { polyfill as polyfillCrypto } from "react-native-polyfill-globals/src/crypto";
import { polyfill as polyfillEncoding } from "react-native-polyfill-globals/src/encoding";
// import { polyfill as polyfillFetch } from "react-native-polyfill-globals/src/fetch";
// import { polyfill as polyfillReadableStream } from "react-native-polyfill-globals/src/readable-stream";
import { polyfill as polyfillURL } from "react-native-polyfill-globals/src/url";

// polyfillBase64();
polyfillCrypto();
polyfillEncoding();
// polyfillFetch();
// polyfillReadableStream();
polyfillURL();

/**
 * Polify BigInt.toJSON for react-native
 * @returns {number}
 */
BigInt.prototype.toJSON = function () {
  return Number(this.toString());
};

if (typeof BigInt === "undefined") global.BigInt = require("big-integer");

// Polyfill for performance.now() on Android
if (!global.performance && global._chronoNow) {
  global.performance = {
    now: global._chronoNow,
  };
}
```

**Note: This file must be imported in the highest component (e.g. index.js).**

### Implement Internet Identity

This package also provides an Internet Identity provider compatible with React Native applications, this provider should be importend and implemented into Client:

```typescript
import * as WebBrowser from "expo-web-browser";

import { InternetIdentityReactNative, ReactNativeStorage } from "@bundly/ares-react-native";

const Browser: AppBrowser = {
  open: (url: string) => {
    WebBrowser.openBrowserAsync(url, { showTitle: false });
  },
  close: () => {
    if (["iOS", "iPadOS"].includes(Device.osName || "")) {
      WebBrowser.dismissBrowser();
    }
  },
};

const client = Client.create({
  agentConfig: {
    host: EXPO_PUBLIC_IC_HOST_URL,
  },
  candidCanisters,
  providers: [
    new InternetIdentityReactNative({
      providerUrl: EXPO_PUBLIC_INTERNET_IDENTITY_MIDDLEWARE_URL!,
      appLink: `${EXPO_PUBLIC_APP_LINK}`,
      browser: Browser,
    }),
  ],
  storage: new ReactNativeStorage(),
});
```

Because Internet Identity is an application that only works with web apps, you need to implement middleware that can catch the identity generated by Internet Identity and return it to the React Native application.

An example in this repo is [Internet Identity Middleware](https://github.com/adrian-d-hidalgo/motoko-react-native/tree/main/frontend/internet-identity-middleware).

Now you can use the Internet Identity Middleware Button to log in your users:

```tsx
import { InternetIdentityMidlewareButton, LogoutButton } from "@bundly/ares-react-native";

<InternetIdentityMidlewareButton />;
```

You can see a full implementation in this repository: [motoko-react-native](https://github.com/adrian-d-hidalgo/motoko-react-native).
