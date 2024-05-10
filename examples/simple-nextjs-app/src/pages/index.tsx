import { AnonymousIdentity } from "@dfinity/agent";

import { AuthButton, useClient } from "@bundly/ares-react";

export default function IcConnectPage() {
  const client = useClient();

  const identity = new AnonymousIdentity();

  function getIdentities() {
    const identities = client.getIdentities();
    console.log({ identities });
  }

  return (
    <div>
      <h1>IC Connect</h1>
      <AuthButton />
      <button onClick={getIdentities}>Get Identities</button>
    </div>
  );
}
