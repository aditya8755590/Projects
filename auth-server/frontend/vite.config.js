// =========================================================
//  vite.config.js
//
//  This project uses CORS (not a dev proxy) so you can SEE the full
//  request URL http://localhost:4000/api/... in the Network tab and
//  watch how cookies + the X-CSRF-Token header are sent cross-origin.
//  The backend (server.js) already allows http://localhost:5173 with
//  credentials, so traffic goes straight from Vite to Express.
// =========================================================

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});