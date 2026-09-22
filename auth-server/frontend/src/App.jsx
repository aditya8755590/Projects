// =========================================================
//  App.jsx
//  Tiny view-router + session manager (no react-router needed).
//
//  1. On first load it asks the server GET /profile with the cookies.
//     If the access token is still valid we restored the session
//     (a great demo: close the tab, reopen it — you are still logged in
//     because the cookie survived, not because the frontend remembers).
//  2. Then it swaps between Login / Register / Profile / Admin pages.
// =========================================================

import { useEffect, useState } from "react";
import { api } from "./api/axios";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import FlowLogPanel from "./components/FlowLogPanel";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("login"); // login | register | profile | admin
  const [restoring, setRestoring] = useState(true);

  // Try to restore the session from the HttpOnly cookies on page load.
  useEffect(() => {
    const restore = async () => {
      console.log("[FRONTEND] Page loaded — checking for existing session cookies...");
      try {
        const { data } = await api.get("/profile");
        console.log("[FRONTEND] Session restored from cookies:", data.data.email);
        setUser(data.data);
        setPage("profile");
      } catch (err) {
        console.log("[FRONTEND] No valid session cookie -> staying on the login page");
        setPage("login");
      } finally {
        setRestoring(false);
      }
    };
    restore();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setPage("profile");
  };

  const handleLogout = async () => {
    try {
      console.log("[FRONTEND] Logout started");
      // POST /auth/logout also carries the CSRF header (interceptor).
      await api.post("/auth/logout");
      console.log("[FRONTEND] Logout complete — cookies cleared");
    } catch (err) {
      console.error("[FRONTEND] Logout error:", err.response?.data?.error);
    }
    setUser(null);
    setPage("login");
  };

  if (restoring) {
    return <div className="card">Checking session...</div>;
  }

  return (
    <>
      <nav className="nav">
        <strong>Auth Learning</strong>
        <span className="grow" />
        {user && (
          <>
            <button onClick={() => setPage("profile")}>Profile</button>
            <button onClick={() => setPage("admin")}>Admin</button>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </nav>

      {!user && page === "register" && (
        <Register onSwitchToLogin={() => setPage("login")} />
      )}

      {!user && page === "login" && (
        <Login
          onLogin={handleLogin}
          onSwitchToRegister={() => setPage("register")}
        />
      )}

      {user && page === "profile" && (
        <Profile user={user} onUserChange={setUser} />
      )}

      {user && page === "admin" && <Admin user={user} />}

      <FlowLogPanel />
    </>
  );
}