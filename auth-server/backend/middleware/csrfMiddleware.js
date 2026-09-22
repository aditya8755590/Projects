// =========================================================
//  middleware/csrfMiddleware.js
//  CSRF protection — the "double submit cookie" pattern.
//
//  WHY IS CSRF NEEDED AT ALL?
//  Our access token travels in a COOKIE. Browsers automatically attach
//  cookies to requests. So if you are logged into evil-site.example and
//  then visit attacker.com, attacker.com can build a <form> that POSTs
//  to evil-site.example/api/profile — and the browser glady sends your
//  cookie along. That is a Cross-Site Request Forgery (CSRF): the
//  attacker "borrows" your identity without knowing your password.
//
//  HOW DOES DOUBLE-SUBMIT-COOKIE FIX IT?
//  During login the server generates a random csrfToken, stores it in a
//  cookie that JavaScript CAN read, and the frontend echoes it back as an
//  X-CSRF-Token header on every state-changing request.
//
//  Cross-site requests can't read our cookie and can't craft the matching
//  header; only scripts running on OUR origin (which can read the cookie)
//  can. The server simply compares: cookie value == header value.
//
//  WHY MUST THE COOKIE NOT BE HttpOnly?
//  - accessToken / refreshToken are HttpOnly: only the server needs them,
//    and making them unreadable to JavaScript means an XSS attack cannot
//    steal them.
//  - csrfToken MUST be readable by JavaScript (the frontend reads it and
//    sends it back as a header), so it CANNOT be HttpOnly.
//  CSRF and XSS are different attacks: HttpOnly defends against XSS for
//  the tokens that matter, and double-submit-cookie defends against CSRF
//  for the one token that has to be JavaScript-readable.
// =========================================================

const { fail } = require("../utils/respond");
const {
  logSection,
  logInfo,
  logSuccess,
  logDetail,
  logBlank,
  CYAN,
} = require("../utils/logger");

// Requests that do NOT change state don't need CSRF protection.
// (GET /profile must work without sending any CSRF token.)
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function csrfProtection(req, res, next) {
  logSection("CSRF CHECK", CYAN);
  logDetail("Method", req.method);
  logDetail("Route", req.originalUrl);

  // 1. Skip read-only requests.
  if (SAFE_METHODS.has(req.method)) {
    logInfo(
      "Read-only request (GET/HEAD/OPTIONS) — no CSRF token required."
    );
    logBlank();
    return next();
  }

  // 2. Read both sides of the double-submit contract:
  //    - the csrfToken from the cookie (set at login)
  //    - the X-CSRF-Token from the header (echoed back by the frontend)
  const cookieToken = req.cookies.csrfToken;
  const headerToken = req.headers["x-csrf-token"];

  logDetail("CSRF cookie present", cookieToken ? "YES" : "NO");
  logDetail("CSRF header present", headerToken ? "YES" : "NO");

  // We log only PRESENCE and MATCH, never the token values.
  if (!cookieToken || !headerToken) {
    return fail(res, 403, "CSRF token missing. Refresh the page and try again.", [
      "CSRF FAILED",
      "Reason: both the csrfToken cookie AND the X-CSRF-Token header are required.",
    ]);
  }

  // 3. Compare cookie vs header.
  logInfo("Comparing cookie token with header token...");
  if (cookieToken !== headerToken) {
    return fail(res, 403, "CSRF token mismatch. Refresh the page and try again.", [
      "CSRF FAILED",
      "Reason: cookie token and header token do NOT match.",
      "Request rejected.",
    ]);
  }

  // 4. Match -> the request really came from our own frontend.
  logSuccess("CSRF VALID — cookie and header tokens match.");
  logBlank();
  return next();
}

module.exports = { csrfProtection };