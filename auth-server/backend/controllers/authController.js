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
const { ROLE } = require("../models/User");
const {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
} = require("../utils/tokens");
const {
  accessCookieOptions,
  refreshCookieOptions,
  csrfCookieOptions,
  clearAuthCookies,
} = require("../utils/cookies");
const { fail } = require("../utils/respond");
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
//  1. REGISTER — create an account
// =========================================================
async function register(req, res) {
  logSection("REGISTER START");
  const { name, email, password } = req.body;

  logDetail("Email", email);

  // ---- Input validation (never trust the client) ----
  if (!name || !email || !password) {
    return fail(res, 400, "Name, email and password are required.", [
      "Registration FAILED: name, email and password are required.",
    ]);
  }
  if (password.length < 6) {
    return fail(res, 400, "Password must be at least 6 characters.", [
      "Registration FAILED: password must be at least 6 characters.",
    ]);
  }

  // ---- Does this email already exist? ----
  logStep(1, "Checking if the email is already registered...");
  const existing = await User.findOne({ email });
  if (existing) {
    return fail(res, 409, "User already exists.", [
      "Registration FAILED: a user with this email already exists.",
    ]);
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
    role: ROLE.USER, // everyone who registers starts as USER
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
    return fail(res, 400, "Email and password are required.", [
      "Login FAILED: email and password are required.",
    ]);
  }

  // 1. Find the user. We need the password hash and refreshTokenHash, which
  //    are select:false by default, so we explicitly opt back in.
  logStep(1, "Searching for user in the database...");
  const user = await User.findOne({ email }).select("+password +refreshTokenHash");

  if (!user) {
    // Generic error on purpose — do NOT reveal whether the email exists,
    // otherwise attackers can enumerate valid accounts.
    return fail(res, 401, "Invalid credentials.", [
      "Login FAILED: no account with that email (generic response sent).",
    ]);
  }
  logSuccess("User found");

  // 2. Compare the submitted password with the stored bcrypt hash.
  logStep(2, "Comparing password with bcrypt...");
  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    // Generic — never say which part was wrong.
    return fail(res, 401, "Invalid credentials.", [
      "Login FAILED: password does not match.",
    ]);
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
    return fail(res, 401, "Not authenticated.", [
      "Refresh FAILED: refresh token MISSING.",
    ]);
  }

  // 2. Verify the refresh token with the REFRESH secret.
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    logStep(1, "Verifying refresh token (refresh secret)...");
    logSuccess("Refresh token signature & expiration VALID");
    logDetail("User ID", decoded.userId);
  } catch (error) {
    const reason =
      error.name === "TokenExpiredError"
        ? "Reason: refresh token EXPIRED (7 days are up) — please log in again."
        : "Reason: refresh token INVALID.";
    return fail(res, 401, "Session expired. Please log in again.", [
      "Refresh FAILED",
      reason,
    ]);
  }

  // 3. Load the user, then check that this exact refresh token is still
  //    the one we issued (compare SHA-256 hashes). This is what makes
  //    REVOCATION possible: logged-out / rotated tokens fail here.
  const user = await User.findById(decoded.userId).select("+refreshTokenHash");
  if (!user) {
    return fail(res, 401, "Session expired.", [
      "Refresh FAILED: user no longer exists.",
    ]);
  }

  if (user.refreshTokenHash !== hashRefreshToken(refreshToken)) {
    return fail(res, 401, "Session expired.", [
      "Refresh FAILED: refresh token was REVOKED or already ROTATED.",
      "This is how production systems invalidate stolen sessions (rotation/replay detection).",
    ]);
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
  logStep(1, "Clearing accessToken, refreshToken and csrfToken cookies");
  clearAuthCookies(res);

  logSuccess("LOGOUT SUCCESS — all cookies cleared");
  logBlank();
  res.status(200).json({ success: true, message: "Logged out." });
}

module.exports = { register, login, refresh, logout };