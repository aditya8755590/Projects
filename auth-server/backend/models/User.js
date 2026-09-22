// =========================================================
//  models/User.js
//  The shape of a user document in MongoDB.
//
//  Two things worth studying here:
//  1. role is an enum -> a user can ONLY be "USER" or "ADMIN",
//     a typo like "AdMn" becomes impossible.
//  2. password & refreshTokenHash use select: false, which means
//     Mongoose will NOT include them when documents are read.
//     The API literally cannot leak the password by accident.
//     A route that truly needs them must opt in with
//     .select("+password"). We explore why in authController.
// =========================================================

const mongoose = require("mongoose");

// The two roles our app understands. Kept in one place so
// the controller/middleware can compare against a shared constant.
const ROLES = ["USER", "ADMIN"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name cannot exceed 80 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // MongoDB index: duplicate emails are rejected (HTTP 409)
      lowercase: true, // always store lowercase -> lookups are exact
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      // NEVER stored as plain text. We only ever store the bcrypt hash
      // (created in authController with bcrypt.hash(password, 12)).
      // select: false -> not returned from queries by default.
      select: false,
    },

    role: {
      type: String,
      enum: ROLES,
      default: "USER", // a brand-new account is a normal user
    },

    // We do NOT store the refresh token itself. We store a SHA-256 hash
    // of it (details in authController). This lets us revoke / rotate
    // sessions while keeping a database leak from handing an attacker
    // a directly-usable token.
    refreshTokenHash: {
      type: String,
      select: false,
    },
  },
  {
    // timestamps: true adds createdAt and updatedAt automatically.
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
module.exports.ROLES = ROLES;