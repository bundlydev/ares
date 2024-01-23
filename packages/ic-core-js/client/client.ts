import { Actor, AnonymousIdentity, HttpAgent, Identity } from "@dfinity/agent";

import { FetchRootKeyError } from "../errors";
import { ActorMap, CanisterMap, CreateClientOptions, IdentityProviders } from "./client.types";

export class Client<T extends Record<string, unknown>> {
  private readonly agent: HttpAgent;
  private identity: Identity;
  private actors: ActorMap<T> = {} as ActorMap<T>;

  private constructor(
    private readonly host: URL,
    private readonly _canisters: CanisterMap<T>,
    private readonly providers: IdentityProviders
  ) {
    this.identity = new AnonymousIdentity();

    this.agent = new HttpAgent({
      host: this.host.origin,
      identity: new AnonymousIdentity(),
      // TODO: try to remove this
      verifyQuerySignatures: false,
    });
  }

  public async init(): Promise<void> {
    await this.fetchRootKey();
    await this.setActors();
  }

  private async fetchRootKey(): Promise<void> {
    if (!this.isLocal()) return;

    try {
      await this.agent.fetchRootKey();
      console.log("Root key fetched");
    } catch (error) {
      throw new FetchRootKeyError(error);
    }
  }

  private isLocal(): boolean {
    const { hostname } = this.host;
    const localHostNames = ["127.0.0.1", "localhost"];
    // TODO: wildcard for ngrok free and premium
    const ngrokHostName = /^.*\.ngrok-free\.app$/;
    const localtunelHostName = /^.*\.loca\.lt$/;

    const isLocal =
      localHostNames.includes(hostname) || ngrokHostName.test(hostname) || localtunelHostName.test(hostname);

    return isLocal;
  }

  public async replaceIdentity(identity: Identity): Promise<void> {
    this.agent.replaceIdentity(identity);

    this.identity = identity;

    await this.setActors();
  }

  public getIdentity(): Identity {
    return this.identity;
  }

  private async setActors(): Promise<void> {
    const actors = Object.entries(this._canisters).reduce((reducer, current) => {
      const [name, canister] = current;
      const { idlFactory, canisterId, configuration = {} } = canister;

      const actor = Actor.createActor(idlFactory, {
        agent: this.agent,
        canisterId,
        ...configuration,
      });

      return {
        ...reducer,
        [name]: actor,
      };
    }, {});

    this.actors = actors as ActorMap<T>;
  }

  public getActor<K extends keyof T>(name: K): ActorMap<T>[K] {
    return this.actors[name];
  }

  public getProviders(): IdentityProviders {
    return this.providers;
  }

  public static create<T extends Record<string, unknown>>(options: CreateClientOptions<T>) {
    const { host, canisters, providers } = options;

    return new Client<T>(new URL(host), canisters, providers);
  }
}
