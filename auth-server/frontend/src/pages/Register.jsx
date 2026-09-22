// =========================================================
//  pages/Register.jsx
//  A simple form: name, email, password.
//  POST /api/auth/register creates the account. No cookies are set by
//  registration — you log in afterwards to get a session.
// =========================================================

import { useState } from "react";
import { api } from "../api/axios";
import { useAuthForm } from "../hooks/useAuthForm";
import Field from "../components/Field";
import Alert from "../components/Alert";

export default function Register({ onSwitchToLogin }) {
  const [message, setMessage] = useState("");
  const { fields, handleFieldChange, error, isSubmitting, submit, setFields } = useAuthForm(
    { name: "", email: "", password: "" },
    (f) => api.post("/auth/register", f),
    "Registration failed."
  );

  const handleSubmit = async (e) => {
    console.log("[FRONTEND] Register request started");
    setMessage("");

    const { response, error: failMsg } = await submit(e);
    if (failMsg) {
      console.error("[FRONTEND] Registration failed:", failMsg);
      return; // error already shown
    }

    console.log("[FRONTEND] Registration successful:", response.data.data.email);

    setMessage(`Account created for ${response.data.data.email} — now log in.`);
    setFields({ name: "", email: "", password: "" });
  };

  return (
    <div className="card">
      <h2>Register</h2>
      <Alert type="ok">{message}</Alert>
      <Alert type="err">{error}</Alert>
      <form onSubmit={handleSubmit}>
        <Field
          label="Name"
          value={fields.name}
          onChange={handleFieldChange("name")}
          required
        />
        <Field
          label="Email"
          type="email"
          value={fields.email}
          onChange={handleFieldChange("email")}
          required
        />
        <Field
          label="Password (min 6 characters)"
          type="password"
          value={fields.password}
          onChange={handleFieldChange("password")}
          minLength={6}
          required
        />
        <button className="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
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