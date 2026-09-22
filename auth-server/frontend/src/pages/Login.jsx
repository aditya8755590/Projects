// =========================================================
//  pages/Login.jsx
//  email + password -> POST /api/auth/login
//
//  IMPORTANT: this page never sees the JWT. The response body only
//  contains public user data (name, email, role). The access/refresh
//  tokens arrive as HttpOnly cookies SET BY THE SERVER, and the browser
//  stores them for us. We never put any token in localStorage.
// =========================================================

import { useState } from "react";
import { api } from "../api/axios";

export default function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log("[FRONTEND] Login request started");

    try {
      const { data } = await api.post("/auth/login", { email, password });

      console.log("[FRONTEND] Login successful — user:", data.data.email);
      console.log(
        "[FRONTEND] Server set cookies: accessToken (HttpOnly), refreshToken (HttpOnly), csrfToken (readable)"
      );
      console.log("[FRONTEND] Tokens never touch JavaScript — they live in HttpOnly cookies");

      // Tell App we are logged in; it hands data.data to Profile/Admin.
      onLogin(data.data);
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed. Is the backend running?";
      setError(msg);
      console.error("[FRONTEND] Login failed:", msg);
    }
  };

  return (
    <div className="card">
      <h2>Login</h2>
      {error && <div className="err">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="primary" type="submit">
          Log in
        </button>
      </form>
      <p className="status">
        No account?{" "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSwitchToRegister();
          }}
        >
          Register
        </a>
      </p>
    </div>
  );
}