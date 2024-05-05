import { ActorMethod, Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";

export type QueryConfig = {
  headers?: Record<string, string>;
  params?: Record<string, string>;
};

export type UpdateConfig = {
  headers?: Record<string, string>;
  params?: Record<string, string>;
};

export interface REST_ACTOR_SERVICE {
  http_request: ActorMethod<
    [
      {
        url: string;
        method: string;
        body: Uint8Array | number[];
        headers: [string, string][];
        certificate_version: [] | [number];
      },
    ],
    {
      body: Uint8Array | number[];
      headers: [string, string][];
      upgrade: [] | [boolean];
      streaming_strategy:
        | []
        | [
            {
              Callback: {
                token: { arbitrary_data: string };
                callback: [Principal, string];
              };
            },
          ];
      status_code: number;
    }
  >;
  http_request_update: ActorMethod<
    [
      {
        url: string;
        method: string;
        body: Uint8Array | number[];
        headers: [string, string][];
        certificate_version: [] | [number];
      },
    ],
    {
      body: Uint8Array | number[];
      headers: [string, string][];
      upgrade: [] | [boolean];
      streaming_strategy:
        | []
        | [
            {
              Callback: {
                token: { arbitrary_data: string };
                callback: [Principal, string];
              };
            },
          ];
      status_code: number;
    }
  >;
}

export type HttpRequest = {
  url: string;
  method: string;
  body: Uint8Array | number[];
  headers: [string, string][];
  certificate_version: [] | [number];
};

export type HttpResponse<T> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  request: HttpRequest;
  // TODO: Add config and request
};
