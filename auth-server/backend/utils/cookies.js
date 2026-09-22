// =========================================================
//  utils/cookies.js
//  Every cookie this app sets, in one place.
//
//  The three cookies all share the same security posture, so a
//  single baseOptions() builds it once and each cookie only
//  supplies its differences:
//
//    accessToken  -> HttpOnly,  15 min  (must match the JWT lifetime)
//    refreshToken -> HttpOnly,  7 days
//    csrfToken    -> NOT HttpOnly, 7 days (the frontend must READ
//                   it and echo it back as X-CSRF-Token — see
//                   csrfMiddleware.js for the full explanation)
//
//  - httpOnly: true  -> invisible to document.cookie, so XSS cannot
//                       steal the auth tokens.
//  - secure:         -> only sent over HTTPS. COOKIE_SECURE flips
//                       between production (true) and local dev
//                       (false, required over plain http://).
//  - sameSite: "lax" -> sent on same-site requests (and top-level GET
//                       navigation); blocks most CSRF on its own.
//  - path: "/"       -> sent for every path on our site.
// =========================================================

const ACCESS_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function baseOptions(overrides) {
  return {
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/",
    ...overrides,
  };
}

function accessCookieOptions() {
  return baseOptions({ httpOnly: true, maxAge: ACCESS_MAX_AGE });
}

function refreshCookieOptions() {
  return baseOptions({ httpOnly: true, maxAge: REFRESH_MAX_AGE });
}

function csrfCookieOptions() {
  return baseOptions({ httpOnly: false, maxAge: REFRESH_MAX_AGE });
}

module.exports = {
  accessCookieOptions,
  refreshCookieOptions,
  csrfCookieOptions,
  ACCESS_MAX_AGE,
  REFRESH_MAX_AGE,
};