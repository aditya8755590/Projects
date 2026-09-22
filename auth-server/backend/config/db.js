// =========================================================
//  config/db.js
//  Establishes the MongoDB connection using Mongoose.
//  Splitting this into its own file keeps server.js short and
//  makes the connection reusable (server.js and seedAdmin.js
//  both call it).
// =========================================================

const mongoose = require("mongoose");
const {
  logSection,
  logStep,
  logSuccess,
  logError,
  logDetail,
  logBlank,
} = require("../utils/logger");

async function connectDB() {
  const uri = process.env.MONGO_URI;

  logSection("DATABASE CONNECTION");
  logStep(1, "Connecting to MongoDB...");

  try {
    // serverSelectionTimeoutMS: fail FAST (5s) with a clear error
    // instead of hanging for 30 seconds when MongoDB is not running.
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    logSuccess("MongoDB connected");
    logDetail("Host", conn.connection.host);
    logDetail("Database", conn.connection.name);
    logBlank();

    return conn;
  } catch (error) {
    logError("MongoDB connection FAILED");
    logError(`Reason: ${error.message}`);
    logError(
      "Is MongoDB running? Try: brew services start mongodb-community@7.0"
    );
    logBlank();
    throw error;
  }
}

module.exports = connectDB;