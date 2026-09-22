// =========================================================
//  pages/Profile.jsx
//
//  Two requests, two different protection levels:
//    GET /api/profile  -> READ ONLY  -> only authentication (no CSRF)
//    PUT /api/profile  -> CHANGES    -> authentication + CSRF header
//
//  Watch the axios interceptors: the CSRF header and the automatic
//  refresh-on-401 both happen behind the scenes.
// =========================================================

import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { getErrorMessage } from "../utils/errors";
import Field from "../components/Field";
import Alert from "../components/Alert";

export default function Profile({ user, onUserChange }) {
  const [profile, setProfile] = useState(user);
  const [name, setName] = useState(user?.name || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // On mount: fetch the latest profile from the server.
  // The accessToken cookie authenticates this GET request.
  useEffect(() => {
    const load = async () => {
      console.log("[FRONTEND] Fetching GET /profile (no CSRF needed — read-only)");
      try {
        const { data } = await api.get("/profile");
        setProfile(data.data);
        setName(data.data.name);
        setMessage("");
        console.log("[FRONTEND] Profile loaded for", data.data.email);
      } catch (err) {
        setError(getErrorMessage(err, "Could not load profile."));
        console.error("[FRONTEND] Profile fetch failed:", getErrorMessage(err));
      }
    };
    load();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    console.log("[FRONTEND] Sending PUT /profile (state-changing -> CSRF header will be added)");

    try {
      const { data } = await api.put("/profile", { name });
      setProfile(data.data);
      onUserChange(data.data); // keep App state in sync

      setMessage("Name updated!");
      console.log("[FRONTEND] Profile updated ->", data.data.name);
    } catch (err) {
      setError(getErrorMessage(err, "Update failed."));
      console.error("[FRONTEND] Profile update failed:", getErrorMessage(err));
    }
  };

  return (
    <div className="card">
      <h2>Profile</h2>

      <Alert type="ok">{message}</Alert>
      <Alert type="err">{error}</Alert>

      <p className="status">
        This data comes from <code>GET /api/profile</code> using the HttpOnly
        accessToken cookie.
      </p>

      <div>
        <Field label="Name" value={profile?.name || ""} readOnly />
        <Field label="Email" value={profile?.email || ""} readOnly />
        <Field label="Role" value={profile?.role || ""} readOnly />
      </div>

      <hr
        style={{
          margin: "20px 0",
          border: "none",
          borderTop: "1px solid #eee",
        }}
      />

      <h3 style={{ marginTop: 0 }}>Update name</h3>
      <form onSubmit={handleUpdate}>
        <Field
          label="New name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          minLength={2}
          required
        />
        <button className="primary" type="submit">
          Update profile (PUT /profile)
        </button>
      </form>
    </div>
  );
}