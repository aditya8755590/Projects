// =========================================================
//  utils/errorHandler.js
//  Maps thrown errors to clean HTTP responses.
//
//  The central error handler in server.js used to send a generic 500
//  for EVERYTHING — including user mistakes like an invalid email or
//  a too-short name. Those are the client's fault, not the server's,
//  so they should be 4xx:
//
//    ValidationError      -> 400  "Please provide a valid email"
//    duplicate key (E11000)-> 409  "User already exists."
//    CastError (bad id)   -> 400  "Invalid request value."
//    anything else        -> 500  "Internal server error." (no leaks)
//
//  The 500 message is deliberately generic — internal details go only
//  to the server log/flow panel, never to the client.
// =========================================================

function errorBody(error) {
  // Mongoose validation failure: pick up the human-readable schema
  // messages (e.g. "Please provide a valid email", from models/User.js).
  if (error && error.name === "ValidationError" && error.errors) {
    const messages = Object.values(error.errors)
      .map((e) => e.message)
      .filter(Boolean);
    return {
      status: 400,
      message: messages.length ? messages.join("; ") : "Validation failed.",
    };
  }

  // Malformed value cast (e.g. an invalid ObjectId in /api/users/:id).
  if (error && error.name === "CastError") {
    return { status: 400, message: "Invalid request value." };
  }

  // MongoDB duplicate-key error (usually a duplicate email).
  if (error && error.code === 11000) {
    return { status: 409, message: "User already exists." };
  }

  // Everything else stays a generic 500: we log the real reason
  // server-side but never hand it to the client.
  return { status: 500, message: "Internal server error." };
}

module.exports = { errorBody };