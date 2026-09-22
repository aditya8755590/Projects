// =========================================================
//  test/errorHandler.test.js
//  Tests for mapping thrown errors to clean HTTP statuses,
//  so a bad email gives 400, a duplicate gives 409 — NOT 500.
// =========================================================

const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");

const { errorBody } = require("../utils/errorHandler");
const logBuffer = require("../utils/logBuffer");

beforeEach(() => logBuffer._reset());

test("Mongoose ValidationError (bad email / short name) -> 400 with the schema message", () => {
  const validationError = {
    name: "ValidationError",
    errors: {
      email: { message: "Please provide a valid email" },
      name: { message: "Name must be at least 2 characters" },
    },
  };

  const { status, message } = errorBody(validationError);

  assert.equal(status, 400);
  assert.match(message, /Please provide a valid email/);
  assert.match(message, /Name must be at least 2 characters/);
});

test("ValidationError with no readable messages -> generic 400", () => {
  const { status, message } = errorBody({ name: "ValidationError", errors: {} });
  assert.equal(status, 400);
  assert.ok(message);
});

test("MongoDB duplicate-key error (code 11000) -> 409", () => {
  const { status, message } = errorBody({ code: 11000 });
  assert.equal(status, 409);
  assert.equal(message, "User already exists.");
});

test("Mongoose CastError (malformed ObjectId) -> 400", () => {
  const { status, message } = errorBody({ name: "CastError" });
  assert.equal(status, 400);
  assert.ok(message);
});

test("anything else -> generic 500 (leaks no internals)", () => {
  const { status, message } = errorBody(new Error("connect ECONNREFUSED secret-db"));
  assert.equal(status, 500);
  assert.equal(message, "Internal server error.");
});