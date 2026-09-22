// =========================================================
//  utils/tokens.js
//  Everything that signs or fingerprints tokens, in one place.
//
//  - createAccessToken: SHORT lived (15 min). Carries userId AND
//    role so requireAdmin can authorize without another DB lookup.
//    Signed with the ACCESS secret.
//  - createRefreshToken: LONG lived (7 days). Carries ONLY userId.
//    Signed with the REFRESH secret — a DIFFERENT secret, so an
//    access token can never be accepted as a refresh token or
//    vice versa.
//  - hashRefreshToken: we never store the raw refresh token. We
//    store its SHA-256 hash, which lets us compare "did this
//    refresh token get issued to this user?" and REVOKE a session
//    on logout, without a database leak handing out a usable token.
//
//  SECURITY RULE: never log the tokens or their hashes.
// =========================================================

const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // Node's built-in crypto (SHA-256)

function createAccessToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role }, // JWT payload
    process.env.JWT_ACCESS_SECRET, // secret #1
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN } // e.g. 15m
  );
}

function createRefreshToken(user) {
  return jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN } // e.g. 7d
  );
}

function hashRefreshToken(refreshToken) {
  return crypto.createHash("sha256").update(refreshToken).digest("hex");
}

module.exports = { createAccessToken, createRefreshToken, hashRefreshToken };