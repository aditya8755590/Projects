// =========================================================
//  utils/requestLogger.js
//  Express middleware that logs every request and its response
//  code. We log only method, path and status — never bodies,
//  passwords or token values.
// =========================================================

const { publish } = require("./logBuffer");

// ---- Request logger: shows every request and its response code ----
// Makes it easy to follow a request from the terminal after clicking a
// button on the frontend. Color codes the status: green 2xx, yellow 4xx,
// red 5xx.
function requestLogger(req, res, next) {
  const start = Date.now();
  console.log(`\n  ➡️  ${req.method} ${req.originalUrl}`);
  publish("http", `➡️  ${req.method} ${req.originalUrl}`);

  res.on("finish", () => {
    const ms = Date.now() - start;
    const color =
      res.statusCode < 400 ? "\x1b[32m" : res.statusCode < 500 ? "\x1b[33m" : "\x1b[31m";
    console.log(
      `  ⬅️  ${req.method} ${req.originalUrl} → ${color}${res.statusCode}\x1b[0m (${ms}ms)`
    );
    publish("http", `⬅️  ${req.method} ${req.originalUrl} → ${res.statusCode} (${ms}ms)`);
  });

  next();
}

module.exports = requestLogger;