// =========================================================
//  routes/authRoutes.js
//  Public auth endpoints: register, login, refresh, logout.
//
//  NOTE: /refresh and /logout are POST (state-changing), so the CSRF
//  middleware protects them too. The frontend's axios interceptor
//  automatically attaches the X-CSRF-Token header, so you won't even
//  notice it there.
// =========================================================

const express = require("express");
const router = express.Router();

const { register, login, refresh, logout } = require("../controllers/authController");
const { csrfProtection } = require("../middleware/csrfMiddleware");

// POST /api/auth/register  -> create a new USER account
router.post("/register", register);

// POST /api/auth/login     -> verify credentials, set cookies
router.post("/login", login);

// POST /api/auth/refresh   -> mint a new access token (rotates refresh token)
router.post("/refresh", csrfProtection, refresh);

// POST /api/auth/logout    -> clear cookies and revoke the session
router.post("/logout", csrfProtection, logout);

module.exports = router;