// =========================================================
//  utils/logBuffer.js
//  A tiny in-memory log ring-buffer + SSE broadcaster.
//
//  Every backend log (from logger.js, the request logger, the
//  error handler) is recorded here AND streamed live to any
//  connected client over Server-Sent Events. The React frontend
//  subscribes to /api/logs/stream and renders the whole
//  "authentication flow" on screen — so you can watch the steps
//  without looking at the terminal.
//
//  SECURITY: the buffer only ever holds SAFE log text (the same
//  facts logger.js already prints). It never contains passwords,
//  hashes, tokens or secrets. It is an unauthenticated read-only
//  stream — fine for a local learning tool.
// =========================================================

const MAX_HISTORY = 200; // cap so a long session can't grow forever

// Every entry: { type, message, ts } where type is one of
// section | step | info | success | warn | error | detail | http
const history = [];

// Live SSE clients (each is an Express `res` we can write() to).
const clients = new Set();

// Heartbeat timers keyed by the same client res, so they can be cleared
// when a client disconnects (or on _reset() during tests).
const heartbeats = new Map();

function broadcast(entry) {
  const payload = `event: log\ndata: ${JSON.stringify(entry)}\n\n`;
  for (const res of clients) {
    try {
      res.write(payload);
    } catch (error) {
      // A broken socket should never take down the request handler.
      clients.delete(res);
    }
  }
}

// Record a log line: push into the ring buffer, trim, then broadcast.
function record(entry) {
  const normalized = { type: entry.type || "info", message: entry.message, ts: Date.now() };
  history.push(normalized);
  if (history.length > MAX_HISTORY) history.shift();
  broadcast(normalized);
  return normalized;
}

// Thin wrapper for the rest of the app: publish("error", "thing blew up").
function publish(type, message) {
  return record({ type, message });
}

// Register one SSE client. Sends the SSE handshake, replays the recent
// history so the panel isn't empty on connect, then keeps the socket
// alive with a ping every 15s. Cleans up automatically on close.
function subscribe(req, res, options = {}) {
  const heartbeatMs = options.heartbeatMs || 15000;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  res.write("retry: 2000\n\n");
  for (const entry of history) {
    res.write(`event: log\ndata: ${JSON.stringify(entry)}\n\n`);
  }

  clients.add(res);
  const heartbeat = setInterval(() => res.write(": ping\n\n"), heartbeatMs);
  heartbeats.set(res, heartbeat);

  req.on("close", () => {
    clearInterval(heartbeat);
    heartbeats.delete(res);
    clients.delete(res);
  });

  return res;
}

// ---- read-only helpers (also used by the tests) ----
function entries() {
  return history.slice(); // a copy — callers can't mutate the buffer
}

function clientCount() {
  return clients.size;
}

// Test hook: wipe state between cases (also clears stray heartbeat timers).
function _reset() {
  for (const heartbeat of heartbeats.values()) clearInterval(heartbeat);
  heartbeats.clear();
  history.length = 0;
  clients.clear();
}

module.exports = {
  MAX_HISTORY,
  record,
  publish,
  subscribe,
  entries,
  clientCount,
  _reset,
};