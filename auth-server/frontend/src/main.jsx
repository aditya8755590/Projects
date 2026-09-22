// =========================================================
//  src/main.jsx
//  React entry point. Renders <App /> into #root.
// =========================================================

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);