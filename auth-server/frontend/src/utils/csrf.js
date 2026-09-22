// =========================================================
//  src/utils/csrf.js
//  Reads the CSRF token from its cookie.
//
//  The server deliberately sets the csrfToken cookie WITHOUT httpOnly,
//  so JavaScript on OUR page can read it here. The axios interceptor
//  (api/axios.js) then attaches it as the X-CSRF-Token header on every
//  state-changing request.
//
//  A script from a DIFFERENT origin cannot read our cookies, which is
//  exactly why the double-submit-cookie pattern blocks CSRF attacks.
// =========================================================

export function getCsrfToken() {
  const cookies = document.cookie.split("; ");
  const match = cookies.find((row) => row.startsWith("csrfToken="));

  if (match) {
    const token = match.split("=").slice(1).join("=");
    console.log("[FRONTEND] CSRF token read from the readable csrfToken cookie");
    return token;
  }

  console.warn("[FRONTEND] No csrfToken cookie found — log in first.");
  return null;
}