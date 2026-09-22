# Auth Learning — Full-Stack Authentication & Authorization

A **learning-first** full-stack project that implements JWT authentication, refresh
tokens, HttpOnly cookies and double-submit-cookie CSRF protection on **Express +
MongoDB**, with a small **React + Vite** frontend.

Everything is **heavily commented** and the terminal/browser console logs **every
step** (registration, login, JWT verification, CSRF checks, role authorization,
refresh rotation, logout). Open this repo in VS Code and follow the flow:

```
Frontend → Axios → Route → Controller → bcrypt/JWT → Cookie → Middleware → Controller → Database
```

---

## Quick Start

```bash
# 1) Start MongoDB (macOS / Homebrew)
brew services start mongodb-community@7.0

# 2) Backend
cd backend
cp .env.example .env        # or keep the provided .env
npm install
npm run seed:admin          # creates admin@example.com / admin123
npm run dev                 # → http://localhost:4000

# 3) Frontend (new terminal)
cd frontend
npm install
npm run dev                 # → http://localhost:5173
```

**Demo accounts**

| Email                    | Password   | Role  |
| ------------------------ | ---------- | ----- |
| admin@example.com        | admin123   | ADMIN |
| (register your own)      | —          | USER  |

> The admin user comes from `backend/scripts/seedAdmin.js`. Register any new user
> through the UI — they always get the `USER` role.

---

## Project Structure

```
auth-server/
│
├── backend/
│   ├── server.js                    # Express app: CORS, cookie-parser, routes, logger, error handler
│   ├── .env.example                 # template — copy to .env (which is gitignored)
│   ├── package.json
│   │
│   ├── config/
│   │   └── db.js                    # Mongoose connection (fails fast if MongoDB is down)
│   │
│   ├── models/
│   │   └── User.js                  # name, email, password(hashed), role, refreshTokenHash, timestamps
│   │
│   ├── controllers/
│   │   ├── authController.js        # register, login, refresh, logout (+ token/cookie helpers)
│   │   └── userController.js        # getProfile, updateProfile, listUsers, deleteUser
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js        # AUTHENTICATION — jwt.verify(accessToken), sets req.user
│   │   ├── csrfMiddleware.js        # double-submit cookie: cookie vs X-CSRF-Token header
│   │   └── roleMiddleware.js        # AUTHORIZATION — requireAdmin
│   │
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth/register | login | refresh | logout
│   │   └── userRoutes.js            # /api/profile, /api/users, /api/users/:id
│   │
│   ├── scripts/
│   │   └── seedAdmin.js             # creates the ADMIN demo account
│   │
│   └── utils/
│       └── logger.js                # pretty banner logger (never logs tokens/passwords)
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx                 # React entry
        ├── App.jsx                  # mini router + session restore
        ├── api/
        │   └── axios.js             # axios instance: withCredentials, CSRF + auto-refresh interceptors
        ├── pages/
        │   ├── Register.jsx
        │   ├── Login.jsx
        │   ├── Profile.jsx
        │   └── Admin.jsx
        └── utils/
            └── csrf.js              # reads the readable csrfToken cookie
```

---

## The Big Picture

```
                        ┌──────────────────────┐
                        │     MongoDB          │
                        │  users collection    │
                        │  - name, email, role │
                        │  - password (bcrypt) │
                        │  - refreshTokenHash  │
                        └─────────▲────────────┘
                                  │ mongoose
     React (5173)                 │           Express (4000)
  ┌──────────────────┐  axios   ┌─┴──────────────────────────────┐
  │ Login/Register   │ ───────▶ │ Routes ─▶ Middleware ─▶ Controllers │
  │ Profile / Admin  │ ◀─────── │ JWT verify · CSRF · requireAdmin  │
  └──────────────────┘ cookies  └─────────────────────────────────┘
        ▲   ▲   ▲
        │   │   │  accessToken (HttpOnly) + refreshToken (HttpOnly)
        │   │   └  csrfToken (READABLE — echoed back as a header)
        │   └────── browser stores these for us automatically
        └────────── JS never sees the JWTs
```

---

## Authentication vs Authorization

```
┌─────────────────────────────────────────────────────────────────┐
│  AUTHENTICATION          AUTHENTICATION AUTHORIZATION           │
│  "Who are you?"          "What are you allowed to do?"          │
│                          AUTHENTICATION AUTHORIZATION           │
├─────────────────────────────────────────────────────────────────┤
│  middleware/authMiddleware     middleware/roleMiddleware        │
│  jwt.verify(accessToken)       req.user.role === "ADMIN"        │
│  PASS  → req.user = {userId,   PASS → next()                    │
│          role}                  FAIL → 403                      │
│  FAIL  → 401                                                     │
└─────────────────────────────────────────────────────────────────┘
```

**The classic rule:** authentication always comes **first**. You cannot check what a
user may do until you know who they are. Every protected route runs
`authenticate` before any authority check.

---

## What is bcrypt?

Passwords are **never** stored as plain text. Instead we store a **bcrypt hash**:

```js
// registration — cost factor 12 (2^12 rounds). More rounds = slower = more secure.
const hashedPassword = await bcrypt.hash(password, 12);
await User.create({ ...values, password: hashedPassword });

// login — compare the submitted password with the stored hash
const passwordMatches = await bcrypt.compare(password, user.password);
```

Why it matters:

- bcrypt generates a **random salt** per password, so identical passwords get
  different hashes (rainbow tables are useless).
- The **cost factor** makes brute-force attempts expensive.
- A database leak yields hashes, not passwords. (They are still crackable via
  dictionary attacks — always require strong passwords.)

`see: backend/models/User.js` (`select: false`) and
`backend/controllers/authController.js`.

---

## What is a JWT?

A **JSON Web Token** is a cryptographically signed, compact string in three parts:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.         <- HEADER
eyJ1c2VySWQiOiIxMjMiLCJyb2xlIjoiVVNFU...    <- PAYLOAD
ZPhtr8ilgaB1b3SsoBokch_XEP7Wui6cUY1reRlwJ7g  <- SIGNATURE
```

### 1. Header

```json
{ "alg": "HS256", "typ": "JWT" }
```

What signing algorithm was used and that this is a JWT. We use **HS256**
(HMAC-SHA256 — one shared secret, ideal for a single auth server).

### 2. Payload

```json
{ "userId": "6ab1...", "role": "USER", "iat": 1790045663, "exp": 1790046563 }
```

The **claims**. We put `userId` and `role` in the **access** token so that
`requireAdmin` can authorize without a database lookup.

> The payload is only **base64 encoded** — anyone can read it. Never put secrets
> in a JWT payload.

### 3. Signature

```
HMACSHA256(
  base64Url(header) + "." + base64Url(payload),
  JWT_ACCESS_SECRET
)
```

The secret proves **we** signed it. Tamper with one byte of the payload and the
signature no longer matches → `jwt.verify()` throws.

---

## `jwt.sign()` — create a token

```js
const token = jwt.sign(
  { userId: user._id.toString(), role: user.role }, // payload
  process.env.JWT_ACCESS_SECRET,                    // signing secret
  { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }  // "15m"
);
```
`see: `createAccessToken()` in authController.js`

## `jwt.verify()` — validate a token (ALWAYS use this for auth)

```js
const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
```

`verify()` checks **both**:

1. **Signature valid?** Recomputes the HMAC with our secret and compares.
2. **Expired?** Compares `exp` against the current time.

Throws `TokenExpiredError` / `JsonWebTokenError` on failure. `see: authMiddleware.js`

## `jwt.decode()` — just read (NEVER for authentication)

```js
const decoded = jwt.decode(token); // base64-decodes the payload. THAT'S ALL.
```

`decode()` performs **no signature check and no expiration check**. Anyone can
forge `{ userId: "...", role: "ADMIN" }`, and `decode()` will cheerfully read it.
**Never use `decode()` to trust identity.**

| Function   | Reads payload | Checks signature | Checks expiry |
| ---------- | ------------- | ---------------- | ------------- |
| `decode()` | ✅            | ❌                | ❌             |
| `verify()` | ✅            | ✅                | ✅             |

---

## Access Token vs Refresh Token

We use **two different tokens**, signed with **two different secrets**.

|               | Access token                                | Refresh token                               |
| ------------- | ------------------------------------------- | ------------------------------------------- |
| Lifetime      | **15 minutes**                              | **7 days**                                  |
| Payload       | `{ userId, role }`                          | `{ userId }`                                |
| Secret        | `JWT_ACCESS_SECRET`                         | `JWT_REFRESH_SECRET`                        |
| Cookie        | `accessToken` (HttpOnly)                    | `refreshToken` (HttpOnly)                   |
| Purpose       | Authenticates every protected request       | Silently mints a new access token           |
| Risk if leaked| Short window, expires quickly               | Long window → attacker stays logged in      |

**Why two tokens?** A short-lived access token limits damage if it leaks. The
refresh token lives longer, but it is only used in one narrow place (the refresh
endpoint) and — in our design — is **hashed at rest** and can be **revoked** on
logout.

---

## Cookies

A cookie is a small key/value pair the server sets via `Set-Cookie`, stored by the
browser, and sent back automatically on later requests. We use cookies (not
localStorage) so JavaScript never has access to the JWTs.

### HttpOnly

`HttpOnly` means **JavaScript cannot read the cookie** (`document.cookie` is empty
for it). Only the browser's network layer sends it. This stops an **XSS attack**
(reinjected script on your page) from stealing your JWT.

```js
res.cookie("accessToken", accessToken, { httpOnly: true, sameSite: "lax", ... });
```

### Secure

`Secure` tells the browser to send the cookie **only over HTTPS**. In
production this must be `true`. In local dev (`http://localhost`) it must be
`false`, or the browser refuses to store the cookie at all.

```js
secure: process.env.COOKIE_SECURE === "true",   // toggled by .env
```

### SameSite

`SameSite=Lax` lets the browser send the cookie on **same-site** requests and on
**top-level GET navigation**, but blocks it on cross-site POST/forms. This alone
defeats the classic CSRF (see below).

```
SameSite=Lax:  localhost:5173  →  localhost:4000   ✅ sent (same site)
               evil-site.com   →  localhost:4000   ❌ no cookie
```

---

## CSRF (Cross-Site Request Forgery)

### The problem

Your tokens ride in **cookies**, and browsers send cookies automatically.

```
You are logged in at bank.com. You visit evil.com.

evil.com:  <form action="https://bank.com/api/profile" method="POST">
               <input name="name" value="hacked">
           </form>
           > submit via JavaScript

Behind the scenes: the BROWSER attaches your bank.com cookies.
bank.com sees: a perfectly legitimate, "authenticated" request.  💥
```

The attacker never sees your cookie — he just **borrows** it. That is CSRF: a
cross-site request that **forges** your identity.

### The fix (double-submit cookie)

At login the server generates a random CSRF token, puts it in a **readable**
cookie, and the frontend echoes it back as `X-CSRF-Token` on every
state-changing request. The server compares cookie vs header.

- **Our site** can read the cookie and send the matching header. ✅
- **evil.com** cannot read our cookie (cross-origin) and cannot guess the random
  token. ❌

```
Login:   Set-Cookie: csrfToken=abc123xyz (READABLE)
Request: Cookie: csrfToken=abc123xyz        ← sent automatically
         X-CSRF-Token: abc123xyz            ← added by our frontend
Server:  cookie === header  →  allow        otherwise → 403
```

### Why is one cookie HttpOnly and the other not?

```
 accessToken / refreshToken → HttpOnly:  only the server reads them.
                                          XSS cannot steal them.
 csrfToken                  → NOT HttpOnly: the frontend must READ it and
                                          echo it back as a header.
```

This looks backwards until you separate two different attacks:

- **XSS** = "malicious script runs inside our page." HttpOnly stops XSS from
  stealing tokens, and the *tokens that matter* (access/refresh) are HttpOnly.
- **CSRF** = "evil-site sends a request that borrows our cookies." The CSRF token
  has to be readable by our own scripts to be echoed as a header — but a readable
  token does not weaken CSRF protection, because the attacker's site still
  cannot read it and cannot forge the header.

`see: middleware/csrfMiddleware.js` for the full comparison logic.

### Why `Authorization: Bearer JWT` changes the picture

If you instead send the JWT in an `Authorization: Bearer <token>` header (the
**SPA + API** pattern), there is **no cookie** and therefore **nothing to
borrow** — the attacker's site cannot craft that header. The CSRF attack surface
mostly disappears (you trade it for needing to protect the token yourself, e.g.
from XSS — which is why the token lives in memory, not localStorage). Cookies +
HttpOnly protect against XSS but *create* the CSRF surface; headers protect
against CSRF but expose the token to XSS. Every team picks one model and
addresses the corresponding threat. This project deliberately teaches the
**cookie + CSRF** model.

---

## 401 vs 403

| Code | Meaning                          | Our usage                                              |
| ---- | -------------------------------- | ------------------------------------------------------ |
| 401  | **Not authenticated** - who are you? | missing/invalid/expired access token; bad credentials |
| 403  | **Not authorized** - you may not do this | CSRF failure; authenticated but not ADMIN             |

- 401 → fix it by **logging in**.
- 403 → you are logged in, but **not allowed** (or the CSRF token is wrong).

---

## API Reference

| Method | Route                   | Middleware                                 | CSRF | Success | Errors                                   |
| ------ | ----------------------- | ------------------------------------------ | ---- | ------- | ---------------------------------------- |
| POST   | `/api/auth/register`    | —                                          | —    | 201     | 400, 400, 409                            |
| POST   | `/api/auth/login`       | —                                          | —    | 200     | 400, 401                                 |
| POST   | `/api/auth/refresh`     | `csrfProtection`                           | ✅   | 200     | 403, 401, 401, 401                       |
| POST   | `/api/auth/logout`      | `csrfProtection`                           | ✅   | 200     | 403                                     |
| GET    | `/api/profile`          | `authenticate`                             | —    | 200     | 401                                     |
| PUT    | `/api/profile`          | `authenticate` → `csrfProtection`          | ✅   | 200     | 401, 403, 400                            |
| GET    | `/api/users`            | `authenticate` → `requireAdmin`            | —    | 200     | 401, 403                                 |
| DELETE | `/api/users/:id`        | `authenticate` → `csrfProtection` → `requireAdmin` | ✅ | 200 | 401, 403, 403, 400, 404 |

---

## The Five Middleware Orders (study these)

```
 Profile read          :  authenticate → controller
 Profile update        :  authenticate → csrfProtection → controller
 List users (admin)    :  authenticate → requireAdmin → controller
 Delete user (admin)   :  authenticate → csrfProtection → requireAdmin → controller
 Refresh / logout      :  csrfProtection → authController
```

Each middleware either calls `next()` (passes you along) or short-circuits with a
status code. Watch the terminal logs to see each gate fire in order.

---

## Verified Walkthrough — "What happens when I click Login until I see /profile"

All paths below point at the real files in this repo.

```
 1. USER CLICKS "LOG IN"
    frontend/src/pages/Login.jsx
    handleSubmit() POSTs { email, password } through our axios instance.

 2. AXIOS ATTACHES THE CSRF HEADER
    frontend/src/api/axios.js  (request interceptor)
    withCredentials: true  ->  the browser is allowed to send cookies.
    Non-GET requests also get  X-CSRF-Token  from frontend/src/utils/csrf.js.

 3. THE REQUEST ARRIVES AT EXPRESS
    backend/server.js
    cors()  ->  cookieParser()  ->  request logger  ->  /api/auth/login route.

 4. THE CONTROLLER CHECKS CREDENTIALS
    backend/controllers/authController.js  (login)
    [1] find user by email        User.findOne().select('+password +refreshTokenHash')
    [2] bcrypt.compare(password, hashedPassword)
        -> 401 "Invalid credentials." (same for unknown email AND wrong password)

 5. TOKENS ARE SIGNED
    createAccessToken()  => jwt.sign({userId, role}, ACCESS_SECRET, {15m})
    createRefreshToken() => jwt.sign({userId},     REFRESH_SECRET, {7d})

 6. THE SERVER STORES THE REFRESH TOKEN AS A HASH
    user.refreshTokenHash = sha256(refreshToken)   (revocation + rotation later)

 7. THREE COOKIES ARE SET
    accessToken  (HttpOnly, 15 min)
    refreshToken (HttpOnly, 7 days)
    csrfToken    (READABLE,  7 days)   -- frontend echoes this back

 8. THE FRONTEND REACTS
    Login.jsx -> App.jsx handleLogin(userData) -> shows <Profile user={user} />.

 9. PROFILE PAGE CALLS GET /api/profile
    frontend/src/pages/Profile.jsx useEffect -> api.get('/profile')
    The browser sends the accessToken cookie — automatically.

10. BACKEND AUTHENTICATES
    backend/middleware/authMiddleware.js
    reads req.cookies.accessToken  ->  jwt.verify(accessToken, ACCESS_SECRET)
    PASS  ->  req.user = { userId, role }  ->  next()

11. CONTROLLER LOADS AND RETURNS THE PROFILE
    backend/controllers/userController.js (getProfile)
    User.findById(req.user.userId)  ->  responds name/email/role.

12. PROFILE RENDERS
    GET /profile was read-only, so NO CSRF header was needed.

13. (SOMETIMES) THE ACCESS TOKEN IS EXPIRED
    Backend answers 401  ->  axios response interceptor calls POST /auth/refresh
    (refreshToken cookie is still valid)  ->  mints new access token + rotates
    the refresh token  ->  replays the original GET /profile transparently.
```

---

## The 10 Tests

> Backend base: `http://localhost:4000/api`. All examples use
> `curl -b cookies.txt -c cookies.txt` to persist cookies. On the **frontend**,
> do the same things through the UI and watch the **browser console** and the
> **backend terminal**.

### TEST 1 — Register

```
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'
```
- **Expected HTTP:** `201`
- **Console:** `REGISTER START` → email lookup → bcrypt hash → user saved →
  `REGISTRATION SUCCESS`.

### TEST 2 — Login

```
curl -c cookies.txt -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'
```
- **Expected HTTP:** `200`
- **Cookies:** `accessToken` (HttpOnly) + `refreshToken` (HttpOnly) +
  `csrfToken` (readable).
- **Console:** the numbered 9-step `LOGIN START` flow.

### TEST 3 — Access profile (read-only, no CSRF)

```
curl -b cookies.txt http://localhost:4000/api/profile
```
- **Expected HTTP:** `200` with `name`, `email`, `role`.
- **Console:** `JWT AUTHENTICATION` → signature VALID → profile loaded.
- **Frontend:** click **Profile**; the app first calls `GET /profile` on load.

### TEST 4 — Update profile (CSRF required)

```
curl -b cookies.txt -X PUT http://localhost:4000/api/profile \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <csrfToken cookie value>" \
  -d '{"name":"Alice Updated"}'
```
- **Expected HTTP:** `200`; the new name is persisted.
- **Console:** `JWT AUTHENTICATION` → `CSRF CHECK` → `CSRF VALID` →
  `UPDATE PROFILE`.
- **Frontend:** type a new name, click "Update profile" — the interceptor adds
  the header for you.

### TEST 5 — Update WITHOUT the CSRF token

```
curl -b cookies.txt -X PUT http://localhost:4000/api/profile \
  -H "Content-Type: application/json" -d '{"name":"Hacker"}'
```
- **Expected HTTP:** `403` — `CSRF token missing...`
- **Console:** `CSRF CHECK` shows `cookie present: YES`, `header present: NO`,
  then `❌ CSRF FAILED`.

### TEST 6 — Admin endpoint as a normal USER

```
curl -b cookies.txt http://localhost:4000/api/users
```
- **Expected HTTP:** `403` — `Forbidden: ADMIN role required.`
- **Console:** `AUTHENTICATION` PASSED (you have a valid token) then
  `AUTHORIZATION CHECK` FAILED. This is the clearest 401-vs-403 demo.

### TEST 7 — Refresh access token

```
curl -b cookies.txt -c cookies.txt -X POST http://localhost:4000/api/auth/refresh \
  -H "X-CSRF-Token: <csrfToken>"
```
- **Expected HTTP:** `200`; a **new** `accessToken` cookie is issued and the
  refresh token is **rotated** (old one is invalidated).
- **Console:** `TOKEN REFRESH` → verify → hash match → rotate → success.

### TEST 8 — Logout

```
curl -b cookies.txt -X POST http://localhost:4000/api/auth/logout \
  -H "X-CSRF-Token: <csrfToken>"
```
- **Expected HTTP:** `200`; all three `Set-Cookie` headers have `Max-Age=0`.
- **DB:** the user's `refreshTokenHash` is deleted (the session is revoked;
  that refresh token can never refresh again).

### TEST 9 — Expired access token

Craft an already-expired access token and use it:

```
node -e "console.log(require('jsonwebtoken').sign(
  { userId:'any', role:'USER' },
  process.env.JWT_ACCESS_SECRET,      // from backend/.env
  { expiresIn:'-1s' }))"
```
- **Expected HTTP:** `401` — `Invalid or expired token...`
- **Console:** `Reason: token EXPIRED`.
- **Frontend equivalent:** with the auto-refresh interceptor, a 401 triggers
  `POST /auth/refresh` and silently re-authenticates instead of failing.

### TEST 10 — Tampered JWT

Take the current accessToken and flip one character (`...KqjdI` → `...KqjdJ`):

```
curl -b cookies.txt http://localhost:4000/api/profile \
  -H "Cookie: accessToken=<tampered>"
```
- **Expected HTTP:** `401` — the signature check fails.
- **Console:** `Reason: INVALID SIGNATURE or malformed token`. This proves
  `verify()` — `decode()` would have happily "read" the tampered token.

---

## Security Rules Followed

- [x] Passwords **never** stored/logged in plain text (bcrypt, cost 12).
- [x] `jwt.verify()` for authentication — never `jwt.decode()`.
- [x] Two different JWT secrets (access vs refresh).
- [x] Short-lived access tokens (15 min).
- [x] Refresh tokens: hashed at rest, rotated on refresh, revoked on logout.
- [x] HttpOnly cookies for all auth tokens (+ `Secure` in production, `Lax`).
- [x] CSRF protection (double-submit cookie) on every state-changing request.
- [x] 403 for authorization failures, 401 for authentication failures.
- [x] Generic login errors ("Invalid credentials." — no account enumeration).
- [x] Server logs only safe facts (userId, email, role, presence/matches).
- [x] `.env` in `.gitignore`; CORS restricted to one origin with credentials.
- [x] `select: false` on `password` / `refreshTokenHash` so they can never
      accidentally appear in API responses.

### Real-production notes (not implemented here — documented instead)

- In production, also: rate limit login/refresh endpoints, use
  `helmet`-style security headers, rotate CSRF tokens per request, store refresh
  tokens with a device/jti identifier, and consider a token-reuse-detection
  policy (immediately revoke the whole session family when a rotated token is
  replayed).

---

## Console Logging Preview (backend)

```
====================================================
LOGIN START
====================================================
  Email: alice@example.com
  [1] Searching for user in the database...
  [2] User found
  [3] Generating access token (15 min, access secret)
  [4] Generating refresh token (7 days, refresh secret)
  [5] Storing refresh-token hash in the database...
  [6] Setting access token cookie (HttpOnly)
  [7] Setting refresh token cookie (HttpOnly)
  [8] Generating CSRF token with Node crypto...
  [9] Setting CSRF cookie (readable by JavaScript)
  LOGIN SUCCESS
  User ID: 6ab1ef8b...
  Role: USER
```

Frontend console is prefixed `[FRONTEND]` so you can match clicks to server logs.

---

## Troubleshooting

| Symptom                                        | Fix                                                              |
| ---------------------------------------------- | ---------------------------------------------------------------- |
| `MongoDB connection FAILED`                    | MongoDB not running → `brew services start mongodb-community@7.0` |
| Login works but requests 500 (CORS console)   | Check backend terminal; `CLIENT_URL` in `.env` must equal the frontend port (5173) |
| Cookies never set in browser DevTools          | `COOKIE_SECURE` must be `false` over plain HTTP locally          |
| `403 CSRF token missing` after a refresh       | Clear cookies, log in again (fresh csrfToken cookie)             |
| Admin page shows `403 Forbidden` for you       | You are USER — that's the authorization lesson. Log in as admin@example.com |
| Vite/backend port already in use               | Change `PORT` in backend `.env` (and CORS/axios baseURL together) |
```

---

## License

MIT — made for learning. Use the README, steal the diagrams, and go build
something.