import { Actor, ActorMethod, AnonymousIdentity, HttpAgent, Identity } from "@dfinity/agent";

import { ClientConfig, IdentityProviders } from "./client.types";

export class Client {
  private actors: Record<string, ActorMethod> = {};
  private identity = new AnonymousIdentity();

  private constructor(private readonly config: ClientConfig) { }

  public async init(identity?: Identity): Promise<void> {
    this.replaceIdentity(identity || this.identity);
  }

  private isLocal(host: string): boolean {
    const { hostname } = new URL(host);
    const localHostNames = ["127.0.0.1", "localhost"];
    // TODO: wildcard for ngrok free and premium
    const ngrokHostName = /^.*\.ngrok-free\.app$/;
    const localtunelHostName = /^.*\.loca\.lt$/;

    const isLocal =
      localHostNames.includes(hostname) || ngrokHostName.test(hostname) || localtunelHostName.test(hostname);

    return isLocal;
  }

  public async replaceIdentity(identity: Identity): Promise<void> {
    this.identity = identity;

    await this.setActors(this.identity);
  }

  public getIdentity(): Identity {
    return this.identity;
  }

  private async setActors(identity: Identity): Promise<void> {
    const { agent, canisters } = this.config;

    const defaultHost = agent.host || "http://localhost:4943";

    const defaultAgent = new HttpAgent({ ...agent, host: defaultHost, identity });

    this.isLocal(defaultHost) && defaultAgent.fetchRootKey().then(() => console.log("Root key fetched"));

    const actors = Object.entries(canisters).reduce((reducer, current) => {
      const [name, canister] = current;

      let localAgent: HttpAgent | undefined;

      if (canister.agent) {
        const localHost = canister.agent.host || "http://localhost:4943";

        localAgent = new HttpAgent({ ...canister.agent, host: localHost, identity });

        this.isLocal(localHost) && localAgent.fetchRootKey().then(() => console.log("Root key fetched"));
      }

      const { idlFactory, configuration } = canister;

      const actor = Actor.createActor(idlFactory, {
        agent: localAgent || defaultAgent,
        ...configuration,
      });

      return {
        ...reducer,
        [name]: actor,
      };
    }, {});

    this.actors = actors;
  }

  public getActor(name: string) {
    return this.actors[name];
  }

  public getIdentityProviders(): IdentityProviders {
    return this.config.identityProviders;
  }

  public static create(config: ClientConfig) {
    return new Client(config);
  }
}
