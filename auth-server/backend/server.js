// =========================================================
//  server.js  —  the entry point of the backend
//
//  Order of middleware matters on purpose (read top to bottom):
//    global middleware  ->  request logger  ->  routes  ->  404/error handlers
//
//  Run:  npm install   then   npm run dev  (or npm start)
// =========================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const logRoutes = require("./routes/logRoutes");

const {
  logSection,
  logInfo,
  logSuccess,
  logError,
  logDetail,
  logBlank,
  GREEN,
} = require("./utils/logger");
const { publish } = require("./utils/logBuffer");
const { getAllowedOrigins, isAllowedOrigin } = require("./utils/cors");
const { errorBody } = require("./utils/errorHandler");

const app = express();

// ---- Global middleware (runs for EVERY request) ----

// Parse JSON request bodies (req.body).
app.use(express.json());

// Parse cookies (req.cookies). Without this, req.cookies.isUndefined.
app.use(cookieParser());

// CORS: trust ONLY our local frontend origins, and CRITICALLY
// `credentials: true` so the browser is allowed to send our cookies.
// Without credentials:true the accessToken/refreshToken cookies would
// never arrive on the backend (the browser would block them as a
// cross-origin misuse of cookies).
//
// We use a FUNCTION as the origin so a request from any OTHER origin
// gets NO Access-Control-Allow-Origin header at all -> the browser then
// refuses to read the response. `!origin` covers non-browser clients
// (curl, Postman) which have no Origin header.
const ALLOWED_ORIGINS = getAllowedOrigins(process.env.CLIENT_URL);
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin, ALLOWED_ORIGINS)) {
        // allow our frontend (and non-browser tools)
        callback(null, true);
      } else {
        // deny everything else — no ACAO header is sent, browser blocks
        callback(null, false);
      }
    },
    credentials: true, // allow cookies to cross the origin boundary
  })
);

// ---- Request logger: shows every request and its response code ----
// This makes it easy to follow a request from the terminal after clicking
// a button on the frontend. We log only method, path and status — never
// bodies, passwords or token values.
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`\n  ➡️  ${req.method} ${req.originalUrl}`);
  publish("http", `➡️  ${req.method} ${req.originalUrl}`);

  res.on("finish", () => {
    const ms = Date.now() - start;
    // Color the status code: green 2xx, yellow 4xx, red 5xx.
    const color =
      res.statusCode < 400 ? "\x1b[32m" : res.statusCode < 500 ? "\x1b[33m" : "\x1b[31m";
    console.log(`  ⬅️  ${req.method} ${req.originalUrl} → ${color}${res.statusCode}\x1b[0m (${ms}ms)`);
    publish("http", `⬅️  ${req.method} ${req.originalUrl} → ${res.statusCode} (${ms}ms)`);
  });

  next();
});

// ---- Routes ----
app.get("/api/health", (req, res) =>
  res.status(200).json({ success: true, message: "Server is running" })
);

app.use("/api/auth", authRoutes); // /api/auth/register, /login, /refresh, /logout
app.use("/api", userRoutes); // /api/profile, /api/users, /api/users/:id
app.use("/api/logs", logRoutes); // GET /api/logs/stream (SSE for the flow panel)

// ---- 404 for unknown routes ----
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found." });
});

// ---- Central error handler ----
// Any error thrown in a controller lands here. We log the real detail on
// the server, but the client sees only a clean, status-appropriate
// message (validation bugs -> 400, duplicates -> 409, real failures ->
// generic 500 — never stack traces or internals).
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const { status, message } = errorBody(err);

  logError("SERVER ERROR");
  logError(`Detail (server-side only): ${err.message}`);
  logError(`Sending HTTP ${status} to the client`);
  logBlank();
  publish("error", `SERVER ERROR → HTTP ${status}: ${message}`);
  res.status(status).json({ success: false, error: message });
});

// ---- Start ----
const PORT = process.env.PORT || 4000;

(async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logSection("SERVER STARTED", GREEN);
      logDetail("Listening on", `http://localhost:${PORT}`);
      logDetail("API base", `http://localhost:${PORT}/api`);
      logDetail("Client origin (CORS)", process.env.CLIENT_URL);
      logInfo("Endpoints:");
      logInfo("  POST   /api/auth/register");
      logInfo("  POST   /api/auth/login");
      logInfo("  POST   /api/auth/refresh");
      logInfo("  POST   /api/auth/logout");
      logInfo("  GET    /api/profile");
      logInfo("  PUT    /api/profile");
      logInfo("  GET    /api/users        (ADMIN)");
      logInfo("  DELETE /api/users/:id    (ADMIN)");
      logBlank();
    });
  } catch (error) {
    logError("Server could not start.");
    logError(error.message);
    process.exit(1);
  }
})();