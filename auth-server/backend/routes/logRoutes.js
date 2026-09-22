// =========================================================
//  routes/logRoutes.js
//  Server-Sent Events stream of the raw log flow.
//
//  GET /api/logs/stream  -> keeps the connection open and pushes
//  every `{type, message, ts}` entry to the frontend "Request Flow"
//  panel as it happens. Replays recent history on connect so the
//  panel is not empty when you open it.
// =========================================================

const express = require("express");
const { subscribe } = require("../utils/logBuffer");

const router = express.Router();

router.get("/stream", subscribe);

module.exports = router;