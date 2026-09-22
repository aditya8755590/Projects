// =========================================================
//  test/serializeUser.test.js
//  Tests that the public user shape sent to the client is safe:
//  a Mongoose document is reduced to exactly id/name/email/role/
//  createdAt — even when the raw document carries a password or
//  refreshTokenHash (as a malicious/leaky query result might).
// =========================================================

const { test } = require("node:test");
const assert = require("node:assert/strict");

const { serializeUser } = require("../utils/serializeUser");

function fakeUser(overrides = {}) {
  return {
    _id: { toString: () => "507f1f77bcf86cd799439011" },
    name: "Ada Lovelace",
    email: "ada@example.com",
    role: "USER",
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    // These are what a careless .select() might surface; the
    // serializer must NEVER forward them.
    password: "$2a$12$super-secret-hash",
    refreshTokenHash: "sha256-secret",
    ...overrides,
  };
}

test("serializeUser keeps only the public fields", () => {
  const result = serializeUser(fakeUser());

  assert.deepEqual(Object.keys(result).sort(), [
    "createdAt",
    "email",
    "id",
    "name",
    "role",
  ]);
  assert.equal(result.id, "507f1f77bcf86cd799439011");
  assert.equal(result.name, "Ada Lovelace");
  assert.equal(result.email, "ada@example.com");
  assert.equal(result.role, "USER");
});

test("serializeUser never leaks password or refreshTokenHash", () => {
  const result = serializeUser(fakeUser());

  assert.ok(!("password" in result));
  assert.ok(!("refreshTokenHash" in result));
  assert.equal(result.password, undefined);
  assert.equal(result.refreshTokenHash, undefined);
});

test("serializeUser keeps the values (does not wrap them)", () => {
  const result = serializeUser(fakeUser());
  assert.equal(result.email, "ada@example.com");
  assert.equal(result.role, "USER");
});

test("serializeUser reflects the real role instead of hardcoding", () => {
  const result = serializeUser(fakeUser({ role: "ADMIN" }));
  assert.equal(result.role, "ADMIN");
});