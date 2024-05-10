import { Client } from "../src/client";
import { InternetIdentity } from "../src/identity-providers";

describe("Client", () => {
  it("should instantiate correctly", async () => {
    const client = Client.create({});

    expect(client).toBeDefined();
    expect(client instanceof Client).toBe(true);
  });
});
