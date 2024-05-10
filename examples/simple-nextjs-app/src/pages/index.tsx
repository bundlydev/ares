import { InternetIdentityButton, LogoutButton, useIdentities } from "@bundly/ares-react";

function onLoginError(error: Error) {
  console.error("Login error", error);
}

export default function IcConnectPage() {
  const identities = useIdentities();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">IC Connect</h1>
      <div className="flex justify-between mb-4">
        <InternetIdentityButton onError={onLoginError} />
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
          {identities.map((item, index) => {
            return (
              <tr key={index} className="hover:bg-gray-100">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{item.provider}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-lg font-medium text-gray-900">
                    {item.identity.getPrincipal().toString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <LogoutButton identity={item.identity} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-4 text-sm text-gray-500">Total de identidades: {identities.length}</p>
    </div>
  );
}
