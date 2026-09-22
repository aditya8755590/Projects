// =========================================================
//  routes/userRoutes.js
//  User-protected routes. Study the MIDDLEWARE ORDER on each route:
//  it is one of the most important things in this project.
//
//  GET    /api/profile      authenticate
//  PUT    /api/profile      authenticate -> csrfProtection
//  GET    /api/users        authenticate -> requireAdmin
//  DELETE /api/users/:id    authenticate -> csrfProtection -> requireAdmin
// =========================================================

const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  listUsers,
  deleteUser,
} = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");
const { csrfProtection } = require("../middleware/csrfMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

// ---- Own profile ----
// GET: read-only, so NO CSRF needed. "Who is the user? -> prove it"
router.get("/profile", authenticate, getProfile);

// PUT: changes state -> the request MUST carry a valid X-CSRF-Token.
router.put("/profile", authenticate, csrfProtection, updateProfile);

// ---- Admin-only area ----
// GET: read-only list; still requires ADMIN authorization.
router.get("/users", authenticate, requireAdmin, listUsers);

// DELETE: state-changing AND admin-only. Watch the full chain:
//   authenticate  (who are you?)
//   -> csrfProtection (did OUR frontend really send this?)
//   -> requireAdmin   (are you allowed to?)
//   -> deleteUser     (do it)
router.delete(
  "/users/:id",
  authenticate,
  csrfProtection,
  requireAdmin,
  deleteUser
);

module.exports = router;