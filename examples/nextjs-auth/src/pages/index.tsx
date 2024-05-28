import { Identity } from "@dfinity/agent";

import { LogoutButton, useAuth, useIdentities } from "@bundly/ares-react";

import Header from "@app/components/header";

export default function IcConnectPage() {
  const { isAuthenticated, currentIdentity, changeCurrentIdentity } = useAuth();
  const identities = useIdentities();

  function formatPrincipal(principal: string): string {
    const parts = principal.split("-");
    const firstPart = parts.slice(0, 2).join("-");
    const lastPart = parts.slice(-2).join("-");
    return `${firstPart}-...-${lastPart}`;
  }

  function disableIdentityButton(identityButton: Identity): boolean {
    return currentIdentity.getPrincipal().toString() === identityButton.getPrincipal().toString();
  }

  return (
    <>
      <Header />
      <main className="p-6">
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-2">User Info</h2>
              <p className="mt-4 text-sm text-gray-500">
                <strong>Status:</strong> {isAuthenticated ? "Authenticated" : "Not Authenticated"}
              </p>
              <p className="text-gray-700">
                <strong>Current Identity:</strong> {currentIdentity.getPrincipal().toString()}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-2">Identities</h2>
              <ul className="divide-y divide-gray-200">
                {identities.map((identity, index) => (
                  <li key={index} className="flex items-center justify-between py-4">
                    <span className="text-gray-900">
                      {formatPrincipal(identity.identity.getPrincipal().toString())}
                    </span>
                    <div className="flex gap-2">
                      <button
                        className={`px-3 py-1 text-sm rounded-md ${
                          disableIdentityButton(identity.identity)
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-500 text-white"
                        }`}
                        disabled={disableIdentityButton(identity.identity)}
                        onClick={() => changeCurrentIdentity(identity.identity)}>
                        Select
                      </button>
                      <LogoutButton identity={identity.identity} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
