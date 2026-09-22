// =========================================================
//  src/api/axios.js
//  ONE axios instance used by every page, plus two interceptors
//  that teach you two important browser-Auth behaviors:
//
//  1. withCredentials: true
//     Our access/refresh tokens live in COOKIES — not localStorage.
//     Browsers normally refuse to send cookies on cross-origin requests
//     unless the client explicitly opts in. withCredentials:true is that
//     opt-in: "hey browser, this request CAN carry our authentication
//     cookies." (The server must also allow it -> cors({ credentials })
//     in server.js.)
//
//  2. The request interceptor attaches X-CSRF-Token automatically.
//     Every PUT / POST / PATCH / DELETE reads the csrfToken cookie and
//     echoes it back as a header, so our pages never forget CSRF.
//     (GET stays clean — read-only requests don't need CSRF.)
//
//  3. The response interceptor handles expired access tokens:
//     on a 401 it calls POST /auth/refresh once, then replays the
//     original request. This is the browser-side of the refresh flow.
// =========================================================

import axios from "axios";
import { getCsrfToken } from "../utils/csrf";

// The one place the backend URL is defined. Pages import `api` from here,
// and FlowLogPanel imports API_BASE_URL to build its SSE stream URL — so a
// port or host change lives in exactly one spot.
export const API_BASE_URL = "http://localhost:4000/api";

export const api = axios.create({
  // Directly to the Express backend (CORS, no proxy — you can see the
  // real URL in the Network tab).
  baseURL: API_BASE_URL,
  // REQUIRED so the browser includes our HttpOnly auth cookies.
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ---------- Request interceptor: add the CSRF header ----------
api.interceptors.request.use((config) => {
  const method = (config.method || "get").toUpperCase();

  // Only state-changing methods get the CSRF header.
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrf = getCsrfToken();
    if (csrf) {
      config.headers["X-CSRF-Token"] = csrf;
      console.log(
        `[FRONTEND] Added X-CSRF-Token header for ${method} ${config.url}`
      );
    } else {
      console.warn("[FRONTEND] State-changing request WITHOUT a CSRF token!");
    }
  }

  return config;
});

// ---------- Response interceptor: auto-refresh on 401 ----------
// When the access token expires (after 15 min), the server answers 401.
// The interceptor transparently:
//   1. POSTs /auth/refresh (the refreshToken cookie does the magic)
//   2. replays the original request with fresh cookies + CSRF header
let refreshingPromise = null; // single-flight: one refresh for N requests

api.interceptors.response.use(
  (response) => response, // success -> pass through
  async (error) => {
    const original = error.config;
    const isAuthRoute = original?.url?.includes("/auth/");

    // Only retry a real 401 from a non-auth endpoint, and only once.
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isAuthRoute
    ) {
      original._retry = true; // prevent infinite loops

      try {
        console.log(
          "[FRONTEND] Got 401 — access token expired. Trying to refresh..."
        );

        if (!refreshingPromise) {
          refreshingPromise = api.post("/auth/refresh");
        }
        await refreshingPromise;
        refreshingPromise = null;

        console.log("[FRONTEND] Refresh succeeded — retrying original request");

        // Refresh may have set new csrf cookie; re-read for the replay.
        const csrf = getCsrfToken();
        if (csrf) original.headers["X-CSRF-Token"] = csrf;

        return api(original); // replay the failed request
      } catch (refreshError) {
        refreshingPromise = null;
        console.warn(
          "[FRONTEND] Refresh failed — session really expired. Please log in again."
        );
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);