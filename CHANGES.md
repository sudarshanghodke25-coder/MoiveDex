# MovieDex — Security Hardening & Deployment Notes

> Everything done in this session, explained simply.
> Goal: deploy MovieDex **safely** — no API keys, Firebase details, or user data leaking.

---

## 1. 🔐 Security Audit Result (what we checked first)

| Check | Result |
| --- | --- |
| `.env` committed to git? | ❌ No — it's in `.gitignore`, exists only on your machine |
| Hardcoded TMDB key in source? | ❌ No — read only from `import.meta.env.VITE_TMDB_API_KEY` |
| Hardcoded Firebase config in source? | ❌ No — all 6 values come from `VITE_*` env vars |
| Secrets in git history? | ❌ No — searched all commits for `AIza...` / TMDB keys |
| `rel="noopener noreferrer"` on all external links | ✅ Already present everywhere (Footer, DetailPage, WatchProviders, About, etc.) |

**The one real risk found:** this is a pure frontend app, so any `VITE_*` value
(including the TMDB key) gets **inlined into the JS bundle** and is visible to
anyone with DevTools. Firebase web config is fine to expose by design — its
security comes from **Firestore Security Rules**. The TMDB key, however, could
be scraped and used to burn your API quota.

---

## 2. 🛡️ What we changed to fix it

### 2.1 TMDB API key hidden behind a serverless proxy  (the big one)

- **New file `api/tmdb.js`** — a Vercel serverless function.
  - The browser requests `GET /api/tmdb?path=/movie/popular&page=1`.
  - The function **adds the key server-side** (`process.env.TMDB_API_KEY`) and
    forwards to TMDB. The key never touches the browser.
  - Validates the requested path (rejects `..`, `//`, backslashes, weird
    segments) and **blocks the client from injecting its own `api_key`**.
  - Forwards `Retry-After` headers (so the existing rate-limit backoff keeps
    working) and adds short caching so repeated loads don't burn TMDB quota.
- **`src/services/tmdb.js` + `tmdbConfig.js`** — when `VITE_USE_TMDB_PROXY=true`,
  every TMDB data call routes through the proxy. When `false` (local dev), it
  calls TMDB directly exactly as before.

### 2.2 Firebase rules — per-user data isolation

- **New file `firestore.rules`** — deploy this to Firebase Console
  (Firestore → Rules). It enforces the data model:
  - `users/{uid}` (profile + settings) — only that user can read/write.
  - `users/{uid}/myList/*`, `users/{uid}/history/*`, `users/{uid}/notifications/*`
    — only that user can read/write.
  - **Everything else is explicitly denied.**
- **New file `storage.rules`** — Firebase Storage isn't used by the app, so all
  access is denied (defense in depth).

### 2.3 Deployment hardening

- **New file `vercel.json`**:
  - SPA rewrite — deep links like `/movie/550` load correctly on refresh
    (routes to `/index.html`, excluding `/api/*`).
  - Security headers on every response:
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: DENY`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### 2.4 Env variable docs

- **`.env.example`** now documents the new vars:
  - `TMDB_API_KEY` — **server-side only** (Vercel env), never a `VITE_` var.
  - `VITE_USE_TMDB_PROXY` — `true` in production, `false` for local dev.
  - `VITE_TMDB_PROXY_URL` — optional override (defaults to `/api/tmdb`).

---

## 3. 🚀 How to deploy (Vercel — recommended)

1. Push the repo to GitHub.
2. On Vercel: **Import Project** → pick the repo → framework auto-detected (Vite).
3. In **Project → Settings → Environment Variables**, add:
   - `TMDB_API_KEY` — your TMDB key (server only, never in bundle)
   - `VITE_TMDB_API_KEY` — can be left empty if proxy is on
   - `VITE_USE_TMDB_PROXY` = `true`
   - Your Firebase `VITE_FIREBASE_*` values (6 of them — safe to expose)
4. Deploy. Every push to `main` auto-deploys; every PR gets a preview URL.
5. In **Firebase Console → Firestore Database → Rules**, paste the contents of
   `firestore.rules` (and `storage.rules` under Storage → Rules).

> **Local dev:** keep `VITE_USE_TMDB_PROXY=false` and `VITE_TMDB_API_KEY` filled
> in your local `.env`. The proxy only runs on Vercel (or `vercel dev`).

> **Not using Vercel?** The proxy concept ports easily:
> Netlify → `netlify/functions/tmdb.mjs` (same logic, `exports.handler`);
> Cloudflare → a Worker. Static-only hosts (GitHub Pages) can't run server
> functions — there the key stays in the bundle, so prefer a serverless host.

---

## 4. ⚠️ Notes & intentional tradeoffs

- **No Content-Security-Policy header** — MovieDex uses inline styles heavily,
  plus YouTube embeds, Firebase/Google domains, and `blob:` media. A strict CSP
  would break the app; a loose one is security theater. It can be added later
  with careful testing if desired.
- **Firebase web config being public is by design** — real protection comes
  from the `firestore.rules` file above. If you ever add server-only logic
  (admin scripts, payment keys), keep those in a backend, **never** in `VITE_*`.
- **No secrets to rotate** — the audit found nothing leaked; no key changes needed.

---

## 5. ✅ Verification

| Check | Result |
| --- | --- |
| `npm run lint` | 0 errors (2 pre-existing benign warnings) |
| `npm run build` | Passes |
| Proxy path validation | Rejects `..`, `//`, backslashes, non-GET, client `api_key` |
| Direct (non-proxy) path | Fully unchanged — local dev keeps working |

---

*Generated with Codebuff 🤖*
