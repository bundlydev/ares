import { AnonymousIdentity, Identity } from "@dfinity/agent";
import { useState } from "react";

import { AuthButton, useClient } from "@bundly/ares-react";

type GetIdentitiesResult = {
  identity: Identity;
  provider: string;
}[];

export default function IcConnectPage() {
  const client = useClient();
  const [identities, setIdentities] = useState<GetIdentitiesResult>(client.getIdentities());

  function getIdentities() {
    const identities = client.getIdentities();
    setIdentities(identities);
  }

  function removeIdentity(identity: Identity) {
    client.removeIdentity(identity.getPrincipal());
    setIdentities(client.getIdentities());
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">IC Connect</h1>
      <div className="flex justify-between mb-4">
        <AuthButton />
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          onClick={getIdentities}>
          Get Identities
        </button>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Provider
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Principal
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {identities.map((identity, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{identity.provider}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-lg font-medium text-gray-900">
                  {identity.identity.getPrincipal().toString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  className="text-sm text-red-600 hover:text-red-900"
                  onClick={() => removeIdentity(identity.identity)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-sm text-gray-500">Total de identidades: {identities.length}</p>
    </div>
  );
}
