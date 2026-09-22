// =========================================================
//  pages/Register.jsx
//  A simple form: name, email, password.
//  POST /api/auth/register creates the account. No cookies are set by
//  registration — you log in afterwards to get a session.
// =========================================================

import { useState } from "react";
import { api } from "../api/axios";

export default function Register({ onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    console.log("[FRONTEND] Register request started");

    try {
      const { data } = await api.post("/auth/register", { name, email, password });

      console.log("[FRONTEND] Registration successful:", data.data.email);

      setMessage(`Account created for ${data.data.email} — now log in.`);
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      const msg = err.response?.data?.error || "Registration failed.";
      setError(msg);
      console.error("[FRONTEND] Registration failed:", msg);
    }
  };

  return (
    <div className="card">
      <h2>Register</h2>
      {message && <div className="ok">{message}</div>}
      {error && <div className="err">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password (min 6 characters)</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        <button className="primary" type="submit">
          Create account
        </button>
      </form>
      <p className="status">
        Already have an account?{" "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSwitchToLogin();
          }}
        >
          Log in
        </a>
      </p>
    </div>
  );
}