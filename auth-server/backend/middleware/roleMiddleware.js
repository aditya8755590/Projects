// =========================================================
//  middleware/roleMiddleware.js
//  AUTHORIZATION — decides WHAT you are allowed to do.
//
//  This runs AFTER authentication. By the time we reach here,
//  req.user was already set by authMiddleware based on a VERIFIED JWT.
//  We never trust a `role` that arrives from the client body — the role
//  only ever comes from the signed token, which cannot be forged.
// =========================================================

const { fail } = require("../utils/respond");
const { ROLE } = require("../models/User");
const {
  logSection,
  logInfo,
  logSuccess,
  logDetail,
  logBlank,
  YELLOW,
} = require("../utils/logger");

// requireAdmin stands between a USER and the admin-only routes.
//   Authentication = Who are you?      (done in authMiddleware)
//   Authorization  = What may you do?  (done right here)
function requireAdmin(req, res, next) {
  logSection("AUTHORIZATION CHECK", YELLOW);
  logInfo("Authorization = 'what are you allowed to do?'");
  logDetail("User ID", req.user ? req.user.userId : "(none)");
  logDetail("Your role", req.user ? req.user.role : "(none)");
  logDetail("Required role", ROLE.ADMIN);

  // A normal USER (or anyone without req.user) is rejected with 403.
  if (!req.user || req.user.role !== ROLE.ADMIN) {
    return fail(res, 403, "Forbidden: ADMIN role required.", [
      "Authorization FAILED",
      "Reason: this account is not an ADMIN.",
    ]);
  }

  logSuccess("Authorization SUCCESS — user is an ADMIN");
  logBlank();
  return next();
}

module.exports = { requireAdmin };