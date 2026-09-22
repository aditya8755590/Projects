// =========================================================
//  components/FlowLogPanel.jsx
//  An on-screen "terminal" that shows the ENTIRE request flow
//  live, so you don't have to Alt-Tab to the terminal.
//
//  Two sources merged into one scrolling feed:
//    • BACKEND  — every log line from Express (REGISTER START,
//                 [1] checking email, bcrypt hash, 401/403s...)
//                 streamed over Server-Sent Events from
//                 GET /api/logs/stream.
//    • FRONTEND — every console.log / console.error call the app
//                 makes (e.g. "[FRONTEND] Register request started")
//                 captured by intercepting window.console.
//
//  Nothing is ever logged that the server wouldn't already print
//  to the terminal — same safe facts (ids, roles, statuses), never
//  passwords or tokens.
// =========================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../api/axios";

const STREAM_URL = `${API_BASE_URL}/logs/stream`;
const MAX_ENTRIES = 300;

// Human-friendly time for each line: [14:03:22]
function timeLabel(ts = Date.now()) {
  const d = new Date(ts);
  return d.toTimeString().slice(0, 8);
}

let entryId = 0;
const nextId = () => ++entryId;

export default function FlowLogPanel() {
  const [entries, setEntries] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [connected, setConnected] = useState(false);
  const bodyRef = useRef(null);

  // Stable appender used by BOTH the console interceptor and the SSE
  // handler. Functional setState — no stale closures.
  const addEntry = useCallback(({ source, type, message }) => {
    const line = {
      id: nextId(),
      source, // "backend" | "frontend"
      type, // section | step | info | ok | warn | error | detail | http | fe
      message,
      ts: Date.now(),
    };
    setEntries((prev) => (prev.length >= MAX_ENTRIES ? [...prev.slice(-(MAX_ENTRIES - 1)), line] : [...prev, line]));
  }, []);

  // Auto-scroll to the newest line as the feed grows.
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  // One-time setup: SSE subscription + console interception.
  useEffect(() => {
    let cleanSse = () => {};

    // Guard for environments without EventSource (e.g. unit tests/node).
    if (typeof window !== "undefined" && typeof EventSource !== "undefined") {
      const es = new EventSource(STREAM_URL);

      es.onopen = () => {
        setConnected(true);
        addEntry({ source: "panel", type: "http", message: "Connected to backend log stream." });
      };
      es.onerror = () => setConnected(false); // EventSource auto-reconnects

      es.addEventListener("log", (event) => {
        try {
          const { type, message } = JSON.parse(event.data);
          addEntry({ source: "backend", type, message });
        } catch {
          /* non-JSON data (pings/comments) — ignore */
        }
      });

      cleanSse = () => es.close();
    }

    // Intercept the app's console calls so its [FRONTEND] logs land in
    // the panel too. The originals are still invoked, so DevTools keeps
    // working exactly as before.
    const originals = {
      log: window.console.log,
      info: window.console.info,
      warn: window.console.warn,
      error: window.console.error,
    };

    const capture = (original, type) => (...args) => {
      original.apply(window.console, args);
      const message = args
        .map((a) => (typeof a === "string" ? a : safeStringify(a)))
        .join(" ");
      if (message.trim()) addEntry({ source: "frontend", type, message });
    };

    window.console.log = capture(originals.log, "fe");
    window.console.info = capture(originals.info, "fe");
    window.console.warn = capture(originals.warn, "warn");
    window.console.error = capture(originals.error, "error");

    return () => {
      cleanSse();
      window.console.log = originals.log;
      window.console.info = originals.info;
      window.console.warn = originals.warn;
      window.console.error = originals.error;
    };
  }, [addEntry]);

  const show = entries.length > 0;
  const dotClass = connected ? "flow-dot flow-dot-on" : "flow-dot";

  if (!show) return null;

  return (
    <div className="flow-panel" data-testid="flow-panel">
      <div className="flow-head">
        <span className={dotClass} title={connected ? "Backend stream connected" : "Backend stream disconnected"} />
        <strong>Request Flow Log</strong>
        <span className="flow-count">{entries.length}</span>
        <span className="grow" />
        <button onClick={() => setEntries([])} className="flow-btn" title="Clear logs">
          Clear
        </button>
        <button onClick={() => setCollapsed((c) => !c)} className="flow-btn" title={collapsed ? "Expand" : "Collapse"}>
          {collapsed ? "+" : "–"}
        </button>
      </div>
      {!collapsed && (
        <div className="flow-body" ref={bodyRef}>
          {entries.map((e) => (
            <div key={e.id} className={`flow-line ${e.type}`}>
              <span className="flow-time">{timeLabel(e.ts)}</span>
              <span className={`flow-src flow-src-${e.source}`}>
                {e.source === "backend" ? "BE" : e.source === "frontend" ? "FE" : "•"}
              </span>
              <span className="flow-txt">{e.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function safeStringify(value) {
  try {
    return typeof value === "object" ? JSON.stringify(value) : String(value);
  } catch {
    return String(value);
  }
}