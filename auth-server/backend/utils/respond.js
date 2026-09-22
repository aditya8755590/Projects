// =========================================================
//  utils/respond.js
//  One consistent way to send an error response.
//
//  Every controller and middleware used to hand-write the same
//  three-liner:
//
//      logError("thing FAILED ...");
//      logError("HTTP 401");
//      logBlank();
//      return res.status(401).json({ success: false, error: "..." });
//
//  That block was copy-pasted a dozen times. `fail()` owns it now:
//
//      return fail(res, 401, "Not authenticated.", [
//        "JWT AUTHENTICATION FAILED",
//        "Reason: token MISSING",
//      ]);
//
//  The error message you pass is the ONLY thing the client sees —
//  the log lines are server-side only, and we never leak internals.
// =========================================================

const { logError, logBlank } = require("./logger");

function fail(res, status, message, log = []) {
  const lines = Array.isArray(log) ? log : [log].filter(Boolean);

  for (const line of lines) logError(line);
  logError(`HTTP ${status}`);
  logBlank();

  return res.status(status).json({ success: false, error: message });
}

module.exports = { fail };