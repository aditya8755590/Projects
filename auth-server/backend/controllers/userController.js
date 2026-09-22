// =========================================================
//  controllers/userController.js
//  User-facing routes: viewing & updating the profile, plus the
//  admin-only user-management routes.
//
//  These controllers only ever run AFTER the middleware chain has
//  already authenticated (and for admin routes, authorized) the request.
// =========================================================

const User = require("../models/User");
const {
  logSection,
  logStep,
  logInfo,
  logSuccess,
  logError,
  logDetail,
  logBlank,
} = require("../utils/logger");

// Safe projection: never send password/refreshTokenHash to the client.
const SAFE_FIELDS = "name email role createdAt";

// ---- GET /api/profile (no CSRF: read-only) ----
//  authenticate  ->  this controller
async function getProfile(req, res) {
  logSection("GET PROFILE");

  // req.user was set by authMiddleware from the verified JWT.
  logDetail("Requested by user id", req.user.userId);

  const user = await User.findById(req.user.userId);
  if (!user) {
    logError("Profile FAILED: user no longer exists.");
    logError("HTTP 404");
    logBlank();
    return res.status(404).json({ success: false, error: "User not found." });
  }

  logSuccess("Profile loaded from database");
  logDetail("Name", user.name);
  logDetail("Role", user.role);
  logBlank();

  res.status(200).json({
    success: true,
    data: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
}

// ---- PUT /api/profile (state-changing: requires CSRF token) ----
//  authenticate -> csrfProtection -> this controller
async function updateProfile(req, res) {
  logSection("UPDATE PROFILE");
  logDetail("User", req.user.userId);

  const { name } = req.body;

  // Only the name is editable in this learning project.
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    logError("Update FAILED: a valid name (min 2 characters) is required.");
    logError("HTTP 400");
    logBlank();
    return res.status(400).json({
      success: false,
      error: "A valid name (min 2 characters) is required.",
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { name: name.trim() },
    { new: true, runValidators: true } // return updated doc, re-run schema rules
  );

  if (!user) {
    logError("Update FAILED: user not found.");
    logError("HTTP 404");
    logBlank();
    return res.status(404).json({ success: false, error: "User not found." });
  }

  logSuccess("Profile updated in database");
  logDetail("New name", user.name);
  logBlank();

  res.status(200).json({
    success: true,
    data: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

// ---- GET /api/users (admin only, read-only) ----
//  authenticate -> requireAdmin -> this controller
async function listUsers(req, res) {
  logSection("LIST USERS (ADMIN)");

  const users = await User.find().select(SAFE_FIELDS).sort({ createdAt: -1 });

  logSuccess(`Loaded ${users.length} user(s) from the database`);
  users.forEach((u) => logInfo(`  - ${u.email} (role: ${u.role})`));
  logBlank();

  res.status(200).json({
    success: true,
    data: users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    })),
  });
}

// ---- DELETE /api/users/:id (admin only, state-changing) ----
//  authenticate -> csrfProtection -> requireAdmin -> this controller
async function deleteUser(req, res) {
  logSection("DELETE USER (ADMIN)");
  const targetId = req.params.id;
  logDetail("Target user id", targetId);

  // Safety: an admin should not be able to delete their own account.
  if (targetId === req.user.userId) {
    logError("Delete FAILED: you cannot delete your own account.");
    logError("HTTP 400");
    logBlank();
    return res
      .status(400)
      .json({ success: false, error: "You cannot delete your own account." });
  }

  const user = await User.findByIdAndDelete(targetId);

  if (!user) {
    logError("Delete FAILED: user not found.");
    logError("HTTP 404");
    logBlank();
    return res.status(404).json({ success: false, error: "User not found." });
  }

  logSuccess("User deleted from the database");
  logDetail("Deleted", user.email);
  logBlank();

  res.status(200).json({
    success: true,
    message: `User ${user.email} deleted.`,
  });
}

module.exports = { getProfile, updateProfile, listUsers, deleteUser };