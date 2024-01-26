export type InAppBrowser = {
  open: (url: string) => void;
  close: () => void;
};

export type InternetIdentityReactNativeConfig = {
  providerUrl: string;
  appLink: string;
  inAppBrowser: InAppBrowser;
};
