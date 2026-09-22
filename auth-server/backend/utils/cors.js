// =========================================================
//  utils/cors.js
//  A tiny, testable CORS origin allowlist.
//
//  The backend trusts ONLY these origins for credentialed requests.
//  By default we accept every natural way to reach the local Vite app:
//    http://localhost:5173   (standard)
//    http://127.0.0.1:5173   (IPv4 address habit)
//    http://[::1]:5173       (IPv6 — Vite often binds here on macOS)
//  Opening the app via any of these used to be silently blocked at the
//  CORS layer while Postman/curl worked, which is confusing. All three
//  work now.
//
//  CLIENT_URL may be a comma-separated list of origins, overriding the
//  default. Requests with NO Origin header (curl, Postman, servers)
//  are always allowed.
// =========================================================

const DEFAULT_ALLOWED_ORIGINS =
  "http://localhost:5173,http://127.0.0.1:5173,http://[::1]:5173";

function getAllowedOrigins(envValue) {
  const raw = envValue || DEFAULT_ALLOWED_ORIGINS;
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

// `!origin` covers non-browser clients (curl, Postman) which send no
// Origin header at all — they can never be "cross-origin".
function isAllowedOrigin(origin, allowedOrigins) {
  return !origin || allowedOrigins.includes(origin);
}

module.exports = { getAllowedOrigins, isAllowedOrigin, DEFAULT_ALLOWED_ORIGINS };