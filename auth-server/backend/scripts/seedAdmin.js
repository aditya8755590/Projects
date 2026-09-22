// =========================================================
//  scripts/seedAdmin.js
//  Creates an ADMIN account you can use to test the admin routes:
//     email:    admin@example.com
//     password: admin123
//  Run with:  npm run seed:admin   (from the backend folder)
// =========================================================

require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const {
  logSection,
  logInfo,
  logSuccess,
  logWarn,
  logError,
  logDetail,
  logBlank,
} = require("../utils/logger");

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123"; // DEV ONLY — change in real projects!
const ADMIN_NAME = "Admin";

async function seedAdmin() {
  logSection("SEED ADMIN");

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  logInfo("Connected to MongoDB");

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    logWarn("Admin already exists — nothing to do.");
    logDetail("Email", ADMIN_EMAIL);
    logBlank();
    process.exit(0);
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashed,
    role: "ADMIN",
  });

  logSuccess("Admin user created");
  logDetail("Email", ADMIN_EMAIL);
  logDetail("Password", ADMIN_PASSWORD);
  logDetail("Role", "ADMIN");
  logBlank();

  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin().catch((error) => {
  logError(`Seed failed: ${error.message}`);
  process.exit(1);
});