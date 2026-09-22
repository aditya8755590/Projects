// =========================================================
//  test/respond.test.js
//  Tests for the unified error responder: the client gets the
//  exact status + message we choose, and the detailed reason
//  lines are written to the server log — not the response.
// =========================================================

const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");

const { fail } = require("../utils/respond");
const logBuffer = require("../utils/logBuffer");

beforeEach(() => logBuffer._reset());

function fakeRes() {
  return {
    statusCode: null,
    status(status) {
      this.statusCode = status;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function loggedLines() {
  return logBuffer.entries().map((entry) => entry.message);
}

test("fail() returns the chosen status and a consistent JSON body", () => {
  const res = fakeRes();
  const result = fail(res, 401, "Not authenticated.");

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { success: false, error: "Not authenticated." });
  // Returned so controllers can `return fail(...)`.
  assert.equal(result, res);
});

test("fail() logs an HTTP <status> line to the server log", () => {
  const res = fakeRes();
  fail(res, 403, "Forbidden.");

  const lines = loggedLines();
  assert.ok(lines.includes("HTTP 403"));
});

test("fail() writes string log lines to the server log", () => {
  const res = fakeRes();
  fail(res, 400, "Bad request.", ["Validation FAILED", "Reason: bad email"]);

  const lines = loggedLines();
  assert.ok(lines.includes("Validation FAILED"));
  assert.ok(lines.includes("Reason: bad email"));
});

test("fail() accepts a single string line (no array required)", () => {
  const res = fakeRes();
  fail(res, 500, "Internal server error.", "DB connection refused");

  const lines = loggedLines();
  assert.ok(lines.includes("DB connection refused"));
});

test("fail() never leaks reason lines into the client response", () => {
  const res = fakeRes();
  fail(res, 500, "Internal server error.", ["connect ECONNREFUSED secret-db"]);

  assert.deepEqual(res.body, { success: false, error: "Internal server error." });
  assert.ok(!JSON.stringify(res.body).includes("ECONNREFUSED"));
});