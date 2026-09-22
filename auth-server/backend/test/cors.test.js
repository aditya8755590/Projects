// =========================================================
//  test/cors.test.js
//  Tests for the CORS origin allowlist helper.
// =========================================================

const { test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");

const cors = require("../utils/cors");
const logBuffer = require("../utils/logBuffer");

beforeEach(() => logBuffer._reset());

test("default allowlist contains both localhost and 127.0.0.1 frontends", () => {
  const origins = cors.getAllowedOrigins(undefined);
  assert.ok(origins.includes("http://localhost:5173"));
  assert.ok(origins.includes("http://127.0.0.1:5173"));
});

test("getAllowedOrigins parses a comma-separated env value and trims whitespace", () => {
  const origins = cors.getAllowedOrigins("http://a.com, http://b.com ,");
  assert.deepEqual(origins, ["http://a.com", "http://b.com"]);
});

test("non-browser requests (no Origin) are always allowed", () => {
  assert.equal(cors.isAllowedOrigin(undefined, ["http://localhost:5173"]), true);
  assert.equal(cors.isAllowedOrigin(null, ["http://localhost:5173"]), true);
  assert.equal(cors.isAllowedOrigin("", ["http://localhost:5173"]), true);
});

test("an origin inside the allowlist is allowed", () => {
  assert.equal(cors.isAllowedOrigin("http://localhost:5173", ["http://localhost:5173"]), true);
  assert.equal(cors.isAllowedOrigin("http://127.0.0.1:5173", ["http://localhost:5173", "http://127.0.0.1:5173"]), true);
});

test("an unknown origin is denied", () => {
  assert.equal(cors.isAllowedOrigin("http://evil.com", ["http://localhost:5173"]), false);
});