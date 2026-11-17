// ---------------------------------------------------------------
// JWT SIMULATION
// Builds tokens in the real header.payload.signature format, but the
// "signature" is a simple client-side hash, NOT real cryptography.
// A real app would have the server sign and verify tokens.
// ---------------------------------------------------------------

const SECRET = "task-manager-demo-secret";

const toBase64Url = (str) => {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (str) => {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

// FNV-1a hash -> hex string (stand-in for an HMAC signature)
const sign = (data) => {
  const input = `${data}.${SECRET}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

export const createToken = (payload, expiresInSeconds) => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const body = { ...payload, iat: now, exp: now + expiresInSeconds };

  const data = `${toBase64Url(JSON.stringify(header))}.${toBase64Url(
    JSON.stringify(body)
  )}`;

  return `${data}.${sign(data)}`;
};

// Returns the payload if the token is well-formed, untampered and
// not expired. Otherwise returns null.
export const verifyToken = (token) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    if (sign(`${header}.${payload}`) !== signature) return null;

    const decoded = JSON.parse(fromBase64Url(payload));
    if (!decoded.exp || decoded.exp * 1000 <= Date.now()) return null;

    return decoded;
  } catch {
    return null;
  }
};
