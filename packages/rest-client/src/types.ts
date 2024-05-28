import { Identity } from "@dfinity/agent";

import { CanisterClient, HttpResponse } from "./canister-client";

export type RequestOptions = {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD" | string;
  url: string;
  data?: any;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  identity?: Identity;
  client?: CanisterClient;
};

export type GetConfig = {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  identity?: Identity;
  client?: CanisterClient;
};

export type PostConfig = {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  identity?: Identity;
  client?: CanisterClient;
};

export type PutConfig = {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  identity?: Identity;
  client?: CanisterClient;
};

export type DeleteConfig = {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  identity?: Identity;
  client?: CanisterClient;
};

export type CreateRestClientInstanceOptions = {
  baseURL: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  identity?: Identity;
};

export type RestClientInstance = {
  <T>(options: RequestOptions): Promise<HttpResponse<T>>;
  replaceIdentity: (identity: Identity) => void;
  get: <T>(url: string, config?: GetConfig) => Promise<HttpResponse<T>>;
  post: <T>(url: string, data?: any, config?: PostConfig) => Promise<HttpResponse<T>>;
  put: <T>(url: string, data?: any, config?: PutConfig) => Promise<HttpResponse<T>>;
  delete: <T>(url: string, config?: DeleteConfig) => Promise<HttpResponse<T>>;
};
