import { CanisterClient, HttpResponse } from "./canister-client";

export * from "./types";

import {
    CreateAresInstanceOptions,
    DeleteConfig,
    GetConfig,
    PostConfig,
    PutConfig,
    AresInstance,
    RequestOptions
} from "./types";
import { Identity } from "@dfinity/agent";

const ares = <T>(options: RequestOptions): Promise<HttpResponse<T>> => {
    const { method, url, data, ...config } = options;

    switch (method) {
        case "GET":
            return ares.get<T>(url);
        case "POST":
            return ares.post<T>(url, data, config);
        case "PUT":
            return ares.put<T>(url, data, config);
        case "DELETE":
            return ares.delete<T>(url, config);
        // TODO: Add PATCH, OPTIONS, HEAD methods
        default:
            throw new Error("Invalid method");
    }
};

ares.get = async <T>(url: string, config?: GetConfig): Promise<HttpResponse<T>> => {
    const { identity, ...queryConfig } = config || {};

    const urlObj = new URL(url);
    const client = config?.client || new CanisterClient(urlObj.origin, identity);

    return client.query("GET", urlObj.pathname, queryConfig);
};

ares.post = async <T>(url: string, data: any, config?: PostConfig): Promise<HttpResponse<T>> => {
    const { identity, ...postConfig } = config || {};

    const urlObj = new URL(url);
    const client = config?.client || new CanisterClient(urlObj.origin, identity);

    return client.update("POST", urlObj.pathname, data, postConfig);
};

ares.put = async <T>(url: string, data: any, config?: PutConfig): Promise<HttpResponse<T>> => {
    const { identity, ...putConfig } = config || {};

    const urlObj = new URL(url);
    const client = config?.client || new CanisterClient(urlObj.origin, identity);

    return client.update("PUT", urlObj.pathname, data, putConfig);
};

ares.delete = async <T>(url: string, config?: DeleteConfig): Promise<HttpResponse<T>> => {
    const { identity, ...deleteConfig } = config || {};

    const urlObj = new URL(url);
    const client = config?.client || new CanisterClient(urlObj.origin, identity);

    return client.update("DELETE", urlObj.pathname, {}, deleteConfig);
};

// TODO: Add PATCH, OPTIONS, HEAD methods

ares.create = (options: CreateAresInstanceOptions): AresInstance => {
    const { baseURL, identity } = options;

    const client = new CanisterClient(baseURL, identity);

    const instance = <T>(options: RequestOptions): Promise<HttpResponse<T>> => {
        const { url } = options;
        return ares({
            client,
            ...options,
            url: url.startsWith("/") ? url : `/${url}`
        });
    };

    instance.replaceIdentity = (identity: Identity): void => {
        client.replaceIdentity(identity);
    }

    instance.get = <T>(pathname: string, config?: GetConfig): Promise<HttpResponse<T>> => {
        const url = `${baseURL + (pathname.startsWith("/") ? pathname : `/${pathname}`)}`

        return ares.get(url, {
            identity,
            client,
            ...config
        });
    };

    instance.post = <T>(pathname: string, data?: any, config?: PostConfig): Promise<HttpResponse<T>> => {
        const url = `${baseURL + (pathname.startsWith("/") ? pathname : `/${pathname}`)}`

        return ares.post(url, data, {
            identity,
            client,
            ...config
        });
    };

    instance.put = <T>(pathname: string, data?: any, config?: PutConfig): Promise<HttpResponse<T>> => {
        const url = `${baseURL + (pathname.startsWith("/") ? pathname : `/${pathname}`)}`

        return ares.put(url, data, {
            identity,
            client,
            ...config
        });
    };

    instance.delete = <T>(pathname: string, config?: DeleteConfig): Promise<HttpResponse<T>> => {
        const url = `${baseURL + (pathname.startsWith("/") ? pathname : `/${pathname}`)}`

        return ares.delete(url, {
            identity,
            client,
            ...config
        });
    };

    return instance;
};

export default ares;
