// =========================================================
//  middleware/authMiddleware.js
//  AUTHENTICATION — proves WHO you are.
//
//  This runs on every protected route (profile, admin, ...).
//  It answers the question: "is there a valid signed-in user?"
//
//  NOTE THE DIFFERENCE:
//    Authentication = Who are you?        -> this file
//    Authorization  = What can you do?    -> roleMiddleware.js
// =========================================================

const jwt = require("jsonwebtoken");
const {
  logSection,
  logStep,
  logInfo,
  logSuccess,
  logError,
  logDetail,
  logBlank,
  CYAN,
} = require("../utils/logger");

// ================================================================
//  jwt.decode() vs jwt.verify()  —  KNOW THE DIFFERENCE  (READ ME)
// ================================================================
//   jwt.decode(token)
//     Just base64-decodes the middle (payload) part of the JWT.
//     It does NOT check the signature and does NOT check expiration.
//     ANYONE can craft a fake token and decode() will happily "read" it.
//     Never use decode() for authentication.
//
//   jwt.verify(token, secret)
//     Recomputes the signature using OUR secret and compares it.
//     Also checks the expiration time. Only a token that was really
//     signed by this server (with this secret) passes.
//     This is the ONLY correct tool for authentication.
// ================================================================
function authenticate(req, res, next) {
  logSection("JWT AUTHENTICATION", CYAN);
  logDetail("Route", `${req.method} ${req.originalUrl}`);
  logInfo(
    "Authentication = 'who are you?' — proving the request comes from a signed-in user."
  );

  // 1. Read the access token from the HttpOnly cookie.
  //    The browser stores it for us automatically; we never read it
  //    from localStorage (which would be XSS-visible).
  const token = req.cookies.accessToken;
  logDetail("Access token present", token ? "YES" : "NO");

  if (!token) {
    logError("JWT AUTHENTICATION FAILED");
    logError("Reason: token MISSING (no accessToken cookie)");
    logError("HTTP 401");
    logBlank();
    return res.status(401).json({
      success: false,
      error: "Not authenticated. Please log in.",
    });
  }

  // 2. Verify the JWT: signature + expiration, against the ACCESS secret.
  //    The access secret is different from the refresh secret, so a
  //    refresh token can never pass here (defense in depth).
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    logStep(1, "Verifying JWT (signature + expiration)...");
    logSuccess("Signature: VALID");
    logSuccess("Expiration: VALID");
    logDetail("User ID", decoded.userId);
    logDetail("Role", decoded.role);

    // 3. Attach the verified identity to the request object.
    //    Later middleware (requireAdmin) and controllers can now trust
    //    `req.user` — the token was just proven legitimate.
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    logSuccess("Authentication successful");
    logBlank();
    return next();
  } catch (error) {
    // jsonwebtoken throws named errors; we translate them into readable
    // reasons for the terminal log.
    if (error.name === "TokenExpiredError") {
      logError("JWT AUTHENTICATION FAILED");
      logError("Reason: token EXPIRED (access tokens live only 15 minutes)");
    } else if (error.name === "JsonWebTokenError") {
      logError("JWT AUTHENTICATION FAILED");
      logError("Reason: INVALID SIGNATURE or malformed/tampered token");
    } else {
      logError("JWT AUTHENTICATION FAILED");
      logError(`Reason: ${error.message}`);
    }
    logError("HTTP 401");
    logBlank();
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token. Please log in again.",
    });
  }
}

module.exports = { authenticate };