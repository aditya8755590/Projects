// =========================================================
//  pages/Login.jsx
//  email + password -> POST /api/auth/login
//
//  IMPORTANT: this page never sees the JWT. The response body only
//  contains public user data (name, email, role). The access/refresh
//  tokens arrive as HttpOnly cookies SET BY THE SERVER, and the browser
//  stores them for us. We never put any token in localStorage.
// =========================================================

import { api } from "../api/axios";
import { useAuthForm } from "../hooks/useAuthForm";
import Field from "../components/Field";
import Alert from "../components/Alert";

export default function Login({ onLogin, onSwitchToRegister }) {
  const { fields, handleFieldChange, error, isSubmitting, submit } = useAuthForm(
    { email: "", password: "" },
    (f) => api.post("/auth/login", f),
    "Login failed. Is the backend running?"
  );

  const handleSubmit = async (e) => {
    console.log("[FRONTEND] Login request started");

    const { response, error: failMsg } = await submit(e);
    if (failMsg) {
      console.error("[FRONTEND] Login failed:", failMsg);
      return; // error already shown
    }

    console.log("[FRONTEND] Login successful — user:", response.data.data.email);
    console.log(
      "[FRONTEND] Server set cookies: accessToken (HttpOnly), refreshToken (HttpOnly), csrfToken (readable)"
    );
    console.log("[FRONTEND] Tokens never touch JavaScript — they live in HttpOnly cookies");

    // Tell App we are logged in; it hands response.data.data to Profile/Admin.
    onLogin(response.data.data);
  };

  return (
    <div className="card">
      <h2>Login</h2>
      <Alert type="err">{error}</Alert>
      <form onSubmit={handleSubmit}>
        <Field
          label="Email"
          type="email"
          value={fields.email}
          onChange={handleFieldChange("email")}
          required
        />
        <Field
          label="Password"
          type="password"
          value={fields.password}
          onChange={handleFieldChange("password")}
          required
        />
        <button className="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log in"}
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