// =========================================================
//  test/logBuffer.test.js
//  Tests for the in-memory log buffer + SSE broadcaster that
//  powers the frontend "Request Flow" panel.
//
//  Run: npm test   (uses Node's built-in test runner, zero deps)
// =========================================================

const { test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");

const logBuffer = require("../utils/logBuffer");

// A fake SSE client: an object that records what res.write() receives.
function fakeSseClient() {
  const writes = [];
  return {
    writes,
    setHeader() {},
    flushHeaders() {},
    write(chunk) {
      writes.push(chunk);
      return true;
    },
  };
}

beforeEach(() => logBuffer._reset());

test("record() stores an entry with a timestamp and returns it", () => {
  const entry = logBuffer.record({ type: "info", message: "hello" });

  assert.equal(entry.message, "hello");
  assert.equal(entry.type, "info");
  assert.ok(Number.isFinite(entry.ts));

  const snapshot = logBuffer.entries();
  assert.equal(snapshot.length, 1);
  assert.equal(snapshot[0].message, "hello");
});

test("entries() returns a copy, never the internal array", () => {
  logBuffer.record({ type: "error", message: "boom" });

  const snap1 = logBuffer.entries();
  snap1.push({ type: "info", message: "injected" });

  assert.equal(logBuffer.entries().length, 1);
});

test("history is capped at MAX_HISTORY entries", () => {
  for (let i = 0; i < logBuffer.MAX_HISTORY + 50; i++) {
    logBuffer.record({ type: "info", message: `line-${i}` });
  }
  assert.equal(logBuffer.entries().length, logBuffer.MAX_HISTORY);
  // Oldest entries are dropped first.
  assert.equal(logBuffer.entries()[0].message, "line-50");
});

test("publish() broadcasts immediately to connected clients", () => {
  const client = fakeSseClient();
  logBuffer.subscribe({ on: () => {} }, client);

  logBuffer.publish("success", "REGISTRATION SUCCESS");

  const sse = client.writes.join("");
  assert.ok(sse.includes("event: log"));
  assert.ok(sse.includes("REGISTRATION SUCCESS"));
});

test("subscribe() replays existing history to a new client before live logs", () => {
  logBuffer.record({ type: "step", message: "[1] doing work" });
  const client = fakeSseClient();

  logBuffer.subscribe({ on: () => {} }, client);

  const sse = client.writes.join("");
  assert.ok(sse.includes("retry: 2000"));
  assert.ok(sse.includes("[1] doing work"));
  assert.ok(sse.includes("event: log"));
});

test("subscribe() sends a heartbeat ping to keep the connection alive", async () => {
  const client = fakeSseClient();
  logBuffer.subscribe({ on: () => {} }, client, { heartbeatMs: 10 });

  const timers = require("node:timers/promises");
  await timers.setTimeout(50);

  assert.ok(client.writes.join("").includes(": ping"));
});

test("disconnected clients stop receiving broadcasts", async () => {
  const closeHandlers = {};
  const req = {
    on(event, handler) {
      closeHandlers[event] = handler;
    },
  };
  const client = fakeSseClient();
  logBuffer.subscribe(req, client);

  // Simulate the client dropping the connection.
  closeHandlers.close();
  logBuffer.publish("info", "nobody should see this");

  assert.ok(!client.writes.join("").includes("nobody should see this"));
  assert.equal(logBuffer.clientCount(), 0);
});