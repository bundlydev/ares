export function isLocal(host: string): boolean {
  const { hostname } = new URL(host);
  const localHostNames = ["127.0.0.1", "localhost"];
  // TODO: wildcard for ngrok free and premium
  const ngrokHostName = /^.*\.ngrok-free\.app$/;
  const localtunelHostName = /^.*\.loca\.lt$/;

  const isLocal =
    localHostNames.includes(hostname) || ngrokHostName.test(hostname) || localtunelHostName.test(hostname);

  return isLocal;
}
