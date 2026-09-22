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
        setError(err.response?.data?.error || "Could not load profile.");
        console.error("[FRONTEND] Profile fetch failed:", err.response?.data?.error);
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
      setError(err.response?.data?.error || "Update failed.");
      console.error("[FRONTEND] Profile update failed:", err.response?.data?.error);
    }
  };

  return (
    <div className="card">
      <h2>Profile</h2>

      {message && <div className="ok">{message}</div>}
      {error && <div className="err">{error}</div>}

      <p className="status">
        This data comes from <code>GET /api/profile</code> using the HttpOnly
        accessToken cookie.
      </p>

      <div>
        <label>Name</label>
        <input value={profile?.name || ""} readOnly />
        <label>Email</label>
        <input value={profile?.email || ""} readOnly />
        <label>Role</label>
        <input value={profile?.role || ""} readOnly />
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
        <label>New name</label>
        <input
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