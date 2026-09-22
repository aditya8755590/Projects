// =========================================================
//  utils/logger.js
//  A tiny "learning logger" that makes the terminal output
//  readable while we watch authentication happen step by step.
//
//  SECURITY RULE: NEVER log passwords, password hashes, full
//  JWT tokens, refresh tokens or secrets through this logger.
//  We only log SAFE facts: user id, email, role, and whether
//  a thing exists / matched / failed.
// =========================================================

// ---- ANSI colors so the terminal is easier to scan ----
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const MAGENTA = "\x1b[35m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const BLUE = "\x1b[34m";

// Every log line is ALSO pushed into the log buffer so the React
// "Request Flow" panel can show the same steps the terminal does.
// The buffer holds the same safe text we print — never secrets.
const { publish } = require("./logBuffer");

// Prints a big banner (a visual "section" boundary):
//
//     ================================================
//     🔐  LOGIN START
//     ================================================
function logSection(title, color = MAGENTA) {
  console.log("\n" + "=".repeat(52));
  console.log(`${color}${title}${RESET}`);
  console.log("=".repeat(52));
  publish("section", title);
}

// Prints one numbered step, e.g.:
//   [1] Searching for user in the database...
function logStep(number, message, color = CYAN) {
  console.log(`  ${color}[${number}]${RESET} ${message}`);
  publish("step", `[${number}] ${message}`);
}

// Prints a plain informational line.
function logInfo(message) {
  console.log(`  ${DIM}${message}${RESET}`);
  publish("info", message);
}

// Prints a success line.
function logSuccess(message) {
  console.log(`  ${GREEN}${message}${RESET}`);
  publish("success", message);
}

// Prints a warning line.
function logWarn(message) {
  console.log(`  ${YELLOW}${message}${RESET}`);
  publish("warn", message);
}

// Prints an error line.
function logError(message) {
  console.log(`  ${RED}${message}${RESET}`);
  publish("error", message);
}

// Prints an empty line for visual spacing.
function logBlank() {
  console.log();
}

// Prints a label: value pair, e.g.  Email: alice@example.com
function logDetail(label, value) {
  console.log(`  ${BOLD}${label}:${RESET} ${value}`);
  publish("detail", `${label}: ${value}`);
}

module.exports = {
  logSection,
  logStep,
  logInfo,
  logSuccess,
  logWarn,
  logError,
  logBlank,
  logDetail,
  // Colors are exported too (e.g. GREEN) so other files can choose the
  // banner color: logSection("SERVER STARTED", GREEN)
  GRAY: DIM,
  MAGENTA,
  CYAN,
  GREEN,
  YELLOW,
  RED,
  BLUE,
};