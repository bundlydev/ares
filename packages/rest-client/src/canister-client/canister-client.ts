import { Actor, ActorSubclass, HttpAgent, Identity } from "@dfinity/agent";
import HttpStatus from "http-status-codes";;

import { idlFactory } from "./api-rest.did";
import { QueryConfig, UpdateConfig, HttpResponse, REST_ACTOR_SERVICE, HttpRequest } from "./canister-client.types";
import { parseBodyRequest, parseHeadersRequest } from "./request-parsers";
import { parseBodyResponse, parseHeadersResponse } from "./response-parsers";

export class CanisterClient {
    private url: URL;
    private agent: HttpAgent;
    private actor: ActorSubclass<REST_ACTOR_SERVICE>;

    constructor(url: string, private identity?: Identity) {
        this.url = new URL(url);
        const canisterId = this.extractId(this.url.origin);
        const hostUrl = this.getHostUrl(this.url.origin);
        this.agent = this.createAgent(hostUrl, this.identity);
        this.actor = this.createActor(canisterId);
    }

    private extractId(url: string): string {
        var pattern = /(?:https?:\/\/)([^\/.]+)\./;
        var match = url.match(pattern);
        if (match) {
            return match[1];
        } else {
            throw new Error("Invalid URL");
        }
    }

    private getHostUrl(url: string): string {
        const textToReplace = `${this.extractId(url)}.`;
        const hostUrl = new URL(url.replace(textToReplace, "")).href;
        return hostUrl;
    }

    private createAgent(hostUrl: string, identity?: Identity): HttpAgent {
        const agent = new HttpAgent({
            host: hostUrl,
            identity
        });

        return agent;
    }

    private createActor(canisterId: string): ActorSubclass<REST_ACTOR_SERVICE> {
        return Actor.createActor(idlFactory, {
            agent: this.agent,
            canisterId
        });
    }

    public replaceIdentity(identity: Identity) {
        this.identity = identity;
        this.agent.replaceIdentity(identity);
    }

    public async query(method: string, pathname: string, config?: QueryConfig): Promise<HttpResponse<any>> {
        // TODO: Execute this only if host is local
        await this.agent.fetchRootKey().then(() => { console.log("Root key fetched") });

        const queryParams = config?.params ? `?${new URLSearchParams(config.params).toString()}` : "";

        const request: HttpRequest = {
            method,
            url: `${pathname || '/'}${queryParams}`,
            body: [],
            headers: config?.headers ? parseHeadersRequest(config.headers) : [],
            certificate_version: []
        }

        const result = await this.actor.http_request(request);

        if (result.status_code >= 400) {
            const error = {
                data: parseBodyResponse(result.body),
                status: result.status_code,
                statusText: HttpStatus.getStatusText(result.status_code),
                headers: parseHeadersResponse(result.headers),
                request
            }

            throw error;
        }

        const response: HttpResponse<any> = {
            data: parseBodyResponse(result.body),
            status: result.status_code,
            statusText: HttpStatus.getStatusText(result.status_code),
            headers: parseHeadersResponse(result.headers),
            request
        }

        return response;
    }

    public async update(method: string, pathname: string, data?: any, config?: UpdateConfig): Promise<HttpResponse<any>> {
        // TODO: Execute this only if host is local
        await this.agent.fetchRootKey().then(() => { console.log("Root key fetched") });

        const queryParams = config?.params ? `?${new URLSearchParams(config.params).toString()}` : "";
        const body = data ? parseBodyRequest(data) : [];
        const customHeaders: [string, string][] = config?.headers ? parseHeadersRequest(config.headers) : [];
        const headers: [string, string][] = [
            ["Content-Length", `${body?.length ?? 0}`],
            ...customHeaders
        ];

        const request: HttpRequest = {
            method,
            url: `${pathname || '/'}${queryParams}`,
            body: data ? parseBodyRequest(data) : [],
            headers,
            certificate_version: []
        }

        const result = await this.actor.http_request_update(request);

        if (result.status_code >= 400) {
            const error = {
                data: parseBodyResponse(result.body),
                status: result.status_code,
                statusText: HttpStatus.getStatusText(result.status_code),
                headers: parseHeadersResponse(result.headers),
                request
            }

            throw error;
        }

        const response: HttpResponse<any> = {
            data: parseBodyResponse(result.body),
            status: result.status_code,
            statusText: HttpStatus.getStatusText(result.status_code),
            headers: parseHeadersResponse(result.headers),
            request
        }

        return response;
    }
}
