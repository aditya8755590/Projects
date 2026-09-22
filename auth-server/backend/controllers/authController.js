// =========================================================
//  controllers/authController.js
//  Everything about creating a session: register, login,
//  refresh-access-token, logout.
//
//  This is where password hashing (bcrypt), JWT signing and
//  cookie setting actually happen. Read the comments top to bottom,
//  then watch the terminal logs when you run it.
// =========================================================

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // Node's built-in crypto (CSRF tokens)
const User = require("../models/User");
const { serializeUser } = require("../utils/serializeUser");
const {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
} = require("../utils/tokens");
const {
  logSection,
  logStep,
  logInfo,
  logSuccess,
  logWarn,
  logError,
  logDetail,
  logBlank,
} = require("../utils/logger");

// =========================================================
//  COOKIE HELPERS
// =========================================================

// The two tokens are HttpOnly: JavaScript on the frontend CANNOT read
// them, so an XSS attack cannot steal them. Only the server can.
//   httpOnly: true        -> invisible to document.cookie on the browser
//   secure: COOKIE_SECURE -> only sent over HTTPS (off in local dev)
//   sameSite: "lax"       -> sent on same-site requests (and top-level GET
//                            navigation); blocks most CSRF on its own

function accessCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes (must match JWT lifetime)
    path: "/",
  };
}

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  };
}

// The CSRF token cookie is deliberately NOT httpOnly — the frontend MUST
// be able to read it (it echoes the value back as an X-CSRF-Token header
// on PUT/POST/PATCH/DELETE requests). See csrfMiddleware.js for the full
// "why is one cookie HttpOnly and the other not?" explanation.
function csrfCookieOptions() {
  return {
    httpOnly: false, // readable by JavaScript — required for CSRF header
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

// =========================================================
//  1. REGISTER — create an account
// =========================================================
async function register(req, res) {
  logSection("REGISTER START");
  const { name, email, password } = req.body;

  logDetail("Email", email);

  // ---- Input validation (never trust the client) ----
  if (!name || !email || !password) {
    logError("Registration FAILED: name, email and password are required.");
    logBlank();
    return res.status(400).json({
      success: false,
      error: "Name, email and password are required.",
    });
  }
  if (password.length < 6) {
    logError("Registration FAILED: password must be at least 6 characters.");
    logBlank();
    return res.status(400).json({
      success: false,
      error: "Password must be at least 6 characters.",
    });
  }

  // ---- Does this email already exist? ----
  logStep(1, "Checking if the email is already registered...");
  const existing = await User.findOne({ email });
  if (existing) {
    logError("Registration FAILED: a user with this email already exists.");
    logError("HTTP 409 Conflict");
    logBlank();
    return res.status(409).json({
      success: false,
      error: "User already exists.",
    });
  }

  // ---- Hash the password with bcrypt (cost factor 12) ----
  // We NEVER store the plain password. bcrypt adds a random salt and runs
  // the hash 2^12 times, making rainbow tables and brute force expensive.
  logStep(2, "Hashing password with bcrypt (cost factor 12)");
  const hashedPassword = await bcrypt.hash(password, 12);
  logInfo("Password hashed (plain text is never stored)");

  // ---- Save the user ----
  logStep(3, "Saving user to database...");
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "USER", // everyone who registers starts as USER
  });
  logSuccess("User created in database");

  logSuccess("REGISTRATION SUCCESS");
  logDetail("User ID", user._id.toString());
  logDetail("Role", user.role);
  logBlank();

  // Note: no cookies are set here. Registration just creates the account;
  // the user then logs in (Login.jsx -> POST /api/auth/login) to get a session.
  res.status(201).json({ success: true, data: serializeUser(user) });
}

// =========================================================
//  2. LOGIN — verify credentials and create a session
// =========================================================
async function login(req, res) {
  logSection("LOGIN START");
  const { email, password } = req.body;

  logDetail("Email", email);

  if (!email || !password) {
    logError("Login FAILED: email and password are required.");
    logBlank();
    return res.status(400).json({
      success: false,
      error: "Email and password are required.",
    });
  }

  // 1. Find the user. We need the password hash and refreshTokenHash, which
  //    are select:false by default, so we explicitly opt back in.
  logStep(1, "Searching for user in the database...");
  const user = await User.findOne({ email }).select("+password +refreshTokenHash");

  if (!user) {
    // Generic error on purpose — do NOT reveal whether the email exists,
    // otherwise attackers can enumerate valid accounts.
    logError("Login FAILED: no account with that email (generic response sent).");
    logError("HTTP 401");
    logBlank();
    return res.status(401).json({
      success: false,
      error: "Invalid credentials.", // same message as wrong password
    });
  }
  logSuccess("User found");

  // 2. Compare the submitted password with the stored bcrypt hash.
  logStep(2, "Comparing password with bcrypt...");
  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    logError("Login FAILED: password does not match.");
    logError("HTTP 401");
    logBlank();
    return res.status(401).json({
      success: false,
      error: "Invalid credentials.", // generic — never say which part was wrong
    });
  }
  logSuccess("Password correct");

  // 3. Sign the two tokens.
  logStep(3, "Generating access token (15 min, access secret)");
  const accessToken = createAccessToken(user);

  logStep(4, "Generating refresh token (7 days, refresh secret)");
  const refreshToken = createRefreshToken(user);

  // 4. Store a HASH of the refresh token server-side. This enables
  //    revocation (logout) and rotation (refresh issues a new token).
  logStep(5, "Storing refresh-token hash in the database...");
  user.refreshTokenHash = hashRefreshToken(refreshToken);
  await user.save();
  logInfo("Refresh-token hash saved (the raw token is never stored)");

  // 5. Set the cookies. Watch these in the DevTools "Network" tab:
  //    Set-Cookie: accessToken=...; HttpOnly; Max-Age=900 ...
  logStep(6, "Setting access token cookie (HttpOnly)");
  res.cookie("accessToken", accessToken, accessCookieOptions());

  logStep(7, "Setting refresh token cookie (HttpOnly)");
  res.cookie("refreshToken", refreshToken, refreshCookieOptions());

  // 6. Generate a CSRF token and hand it to the frontend via a readable cookie.
  logStep(8, "Generating CSRF token with Node crypto...");
  const csrfToken = crypto.randomBytes(32).toString("hex");
  logStep(9, "Setting CSRF cookie (readable by JavaScript)");
  res.cookie("csrfToken", csrfToken, csrfCookieOptions());
  logInfo("CSRF cookie is visible to JS so the frontend can echo it back");

  logSuccess("LOGIN SUCCESS");
  logDetail("User ID", user._id.toString());
  logDetail("Role", user.role);
  logBlank();

  // The response body contains ONLY safe public user data. The tokens live
  // in cookies and never reach JavaScript-land.
  res.status(200).json({ success: true, data: serializeUser(user) });
}

// =========================================================
//  3. REFRESH — mint a new access token when the old one expires
// =========================================================
async function refresh(req, res) {
  logSection("TOKEN REFRESH");

  // 1. Read the refresh token from its HttpOnly cookie.
  const refreshToken = req.cookies.refreshToken;
  logDetail("Refresh token present", refreshToken ? "YES" : "NO");

  if (!refreshToken) {
    logError("Refresh FAILED: refresh token MISSING.");
    logError("HTTP 401");
    logBlank();
    return res.status(401).json({ success: false, error: "Not authenticated." });
  }

  // 2. Verify the refresh token with the REFRESH secret.
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    logStep(1, "Verifying refresh token (refresh secret)...");
    logSuccess("Refresh token signature & expiration VALID");
    logDetail("User ID", decoded.userId);
  } catch (error) {
    logError("Refresh FAILED");
    if (error.name === "TokenExpiredError") {
      logError("Reason: refresh token EXPIRED (7 days are up) — please log in again.");
    } else {
      logError("Reason: refresh token INVALID.");
    }
    logError("HTTP 401");
    logBlank();
    return res.status(401).json({ success: false, error: "Session expired. Please log in again." });
  }

  // 3. Load the user, then check that this exact refresh token is still
  //    the one we issued (compare SHA-256 hashes). This is what makes
  //    REVOCATION possible: logged-out / rotated tokens fail here.
  const user = await User.findById(decoded.userId).select("+refreshTokenHash");
  if (!user) {
    logError("Refresh FAILED: user no longer exists.");
    logError("HTTP 401");
    logBlank();
    return res.status(401).json({ success: false, error: "Session expired." });
  }

  if (user.refreshTokenHash !== hashRefreshToken(refreshToken)) {
    logError("Refresh FAILED: refresh token was REVOKED or already ROTATED.");
    logError(
      "This is how production systems invalidate stolen sessions (rotation/replay detection)."
    );
    logError("HTTP 401");
    logBlank();
    return res.status(401).json({ success: false, error: "Session expired." });
  }
  logSuccess("Refresh token matches the stored hash (still valid)");

  // 4. Mint a new access token and, importantly, ROTATE the refresh token:
  //    we replace the old one with a brand-new refresh token. If an
  //    attacker replays an older token later, it will no longer match.
  logStep(2, "Generating new access token...");
  const newAccessToken = createAccessToken(user);
  logSuccess("New access token created");

  logStep(3, "Rotating refresh token (old one is now invalid)...");
  const newRefreshToken = createRefreshToken(user);
  user.refreshTokenHash = hashRefreshToken(newRefreshToken);
  await user.save();
  logSuccess("Refresh token rotated and stored");

  // 5. Send both tokens as fresh cookies.
  res.cookie("accessToken", newAccessToken, accessCookieOptions());
  res.cookie("refreshToken", newRefreshToken, refreshCookieOptions());

  logSuccess("REFRESH SUCCESS — new access token on its way");
  logBlank();
  res.status(200).json({
    success: true,
    message: "Access token refreshed.",
    data: { role: user.role },
  });
}

// =========================================================
//  4. LOGOUT — kill the session everywhere (cookies + DB)
// =========================================================
async function logout(req, res) {
  logSection("LOGOUT");

  const refreshToken = req.cookies.refreshToken;

  // 1. Revoke the session server-side: delete the stored refresh-token hash
  //    so a stolen/leftover refresh token can never refresh again.
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      // $unset removes the field entirely (e.g. user no longer has a session).
      await User.updateOne(
        { _id: decoded.userId },
        { $unset: { refreshTokenHash: 1 } }
      );
      logSuccess("Refresh token revoked in the database (hash deleted)");
    } catch (error) {
      // Token unusable anyway (expired/invalid) -> nothing to revoke.
      logWarn("Refresh token already invalid — skipping database revocation.");
    }
  }

  // 2. Clear the cookies on the browser. maxAge: 0 tells the browser
  //    to expire them immediately.
  logStep(1, "Clearing accessToken cookie");
  res.cookie("accessToken", "", { ...accessCookieOptions(), maxAge: 0 });

  logStep(2, "Clearing refreshToken cookie");
  res.cookie("refreshToken", "", { ...refreshCookieOptions(), maxAge: 0 });

  logStep(3, "Clearing csrfToken cookie");
  res.cookie("csrfToken", "", { ...csrfCookieOptions(), maxAge: 0 });

  logSuccess("LOGOUT SUCCESS — all cookies cleared");
  logBlank();
  res.status(200).json({ success: true, message: "Logged out." });
}

module.exports = { register, login, refresh, logout };