import { AnonymousIdentity } from "@dfinity/agent";

import { Client } from "../client";

describe("Client", () => {
  it("should instantiate correctly", async () => {
    const options = {
      host: "http://127.0.0.1:4943",
      canisters: {},
      providers: {},
    };

    const client = await Client.create(options);

    expect(client).toBeDefined();
    expect(client instanceof Client).toBe(true);

    expect(client.getIdentity()).toBeDefined();
    expect(client.getProviders()).toBeDefined();

    expect(client.getIdentity().getPrincipal().isAnonymous()).toBe(true);
  });

  it("should assign a new identity correctly", async () => {
    const options = {
      host: "http://127.0.0.1:4943",
      canisters: {},
      providers: {},
    };

    const client = await Client.create(options);

    const previousIdentity = client.getIdentity();
    // A new identity should be retrieved after browser authentication.
    const newIdentity = new AnonymousIdentity();

    await client.replaceIdentity(newIdentity);

    previousIdentity.getPrincipal().toString();

    expect(client.getIdentity().getPrincipal().toString()).not.toBe(
      previousIdentity.getPrincipal().toString()
    );
  });
});
