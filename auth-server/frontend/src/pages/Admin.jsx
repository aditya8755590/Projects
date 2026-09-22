// =========================================================
//  pages/Admin.jsx
//
//  The admin dashboard. Anyone can OPEN this page, but only ADMIN
//  accounts get data. A normal USER sees the server's 403 Forbidden
//  message — this is the perfect live demo of AUTHORIZATION.
//
//    GET    /api/users     -> authenticate + requireAdmin  (read-only)
//    DELETE /api/users/:id -> authenticate + CSRF + requireAdmin
//
//  If you are logged in as USER and see "Forbidden: ADMIN role required."
//  that means authentication PASSED but authorization FAILED. (HTTP 403)
// =========================================================

import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { getErrorMessage } from "../utils/errors";
import Alert from "../components/Alert";

export default function Admin({ user }) {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setError("");
    console.log("[FRONTEND] Fetching GET /users (admin only)");
    try {
      const { data } = await api.get("/users");
      setUsers(data.data);
      console.log(`[FRONTEND] Loaded ${data.data.length} user(s)`);
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to load users.");
      setError(msg);
      // A 403 here is EXPECTED when you are not an admin — it proves
      // that authorization gate is working.
      if (err.response?.status === 403) {
        console.warn("[FRONTEND] 403 Forbidden — your role is not ADMIN.");
      } else {
        console.error("[FRONTEND] Failed to load users:", msg);
      }
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    setMessage("");
    setError("");
    setLoading(true);

    console.log(
      `[FRONTEND] Sending DELETE /users/${id} (admin only + CSRF header)`
    );

    try {
      const { data } = await api.delete(`/users/${id}`);
      setMessage(data.message);
      console.log("[FRONTEND] User deleted:", data.message);
      loadUsers(); // refresh the list
    } catch (err) {
      const msg = getErrorMessage(err, "Delete failed.");
      setError(msg);
      console.error("[FRONTEND] Delete failed:", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <h2>Admin dashboard</h2>
      <p className="status">
        Logged in as <b>{user?.email}</b> (role <b>{user?.role}</b>)
      </p>

      <Alert type="ok">{message}</Alert>
      <Alert type="err">{error}</Alert>

      {users.length > 0 && (
        <div>
          <h3 style={{ marginBottom: 8 }}>All users</h3>
          {users.map((u) => (
            <div className="box" key={u.id}>
              <div>
                <b>{u.name}</b> ({u.role})
                <br />
                <span className="status">
                  {u.email} · joined {new Date(u.createdAt).toLocaleDateString()}
                </span>
              </div>
              <button
                className="danger"
                disabled={loading || u.id === user?.id}
                title={
                  u.id === user?.id ? "You cannot delete yourself" : "Delete user"
                }
                onClick={() => handleDelete(u.id)}
              >
                {u.id === user?.id ? "You" : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}