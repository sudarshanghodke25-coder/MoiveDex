# 🎬 MovieDex

> A premium, dark-themed movie, TV & anime discovery platform — cinematic
> browsing, personalized watchlists, watch history, and rich detail pages,
> powered by **The Movie Database (TMDB)** and **Firebase**.

MovieDex is a fully client-side React application with a luxe "noir cinema"
visual identity: animated 3D hero scenes, buttery GSAP scroll animations, and
deep crimson/gold styling. It keeps your TMDB API key secret in production
behind a serverless proxy and isolates every user's data with Firestore
security rules.

---

## ✨ Features

### 🎥 Discovery
- **Cinematic landing page** — three.js animated background, sparkle cursor trail,
  and a branded intro loader.
- **Home feed** — trending, now playing, popular, top rated, upcoming, TV and
  anime rows, plus a **Continue Watching** rail that resumes where you left off.
- **Browse pages** — dedicated **Movies**, **TV** and **Anime** pages with
  genre filters and sorting (Popular / Top Rated / etc.).
- **Global search** — instant results from TMDB across movies, TV and people.

### 🔍 Rich detail pages
- Hero backdrop, poster, rating, runtime, genres, overview and key crew.
- **Cast & crew** rows with photos, **watch providers** (where to stream),
  **media gallery**, and **external links** (IMDb, TMDB, homepage).
- **Trailer modal** with prioritized official trailers.
- **Seasons & episodes** for TV/anime — per-episode overview, ratings, guest
  stars, crew, and production codes.
- **Person pages** — biography, filmography and credits.

### 👤 Personalization
- **Authentication** — email/password + Google sign-in, email verification,
  and password reset (Firebase Auth).
- **My List** — save any title with one click; synced per user to Firestore.
- **Watch history** — playback progress saved (debounced) and resumable,
  powering Continue Watching.
- **Profile & settings** — manage your account and preferences.

### 🔐 Security & performance
- **TMDB key hidden server-side** — a Vercel serverless proxy (`api/tmdb.js`)
  adds the key on the server; the browser never sees it.
- **Per-user Firestore rules** — each user can only read/write their own data.
- **Route-level code splitting** — heavy pages (landing 3D, detail) load on demand.
- **Rate-limit aware** — request queue with retry/backoff on TMDB 429s.

---

## 🧱 Tech Stack

| Layer        | Technology |
| ------------ | ---------- |
| Framework    | [React 19](https://react.dev) + [Vite 8](https://vite.dev) |
| Routing      | [React Router 7](https://reactrouter.com) |
| Styling      | [Tailwind CSS 4](https://tailwindcss.com) + custom CSS design tokens |
| Animations   | [GSAP](https://gsap.com) + ScrollTrigger |
| 3D / visuals | [Three.js](https://threejs.org) |
| Backend      | [Firebase](https://firebase.google.com) (Auth + Firestore) |
| Data         | [TMDB API](https://developer.themoviedb.org) (via serverless proxy) |
| Hosting      | [Vercel](https://vercel.com) (static + serverless functions) |
| Linting      | [Oxlint](https://oxc.rs) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 20.19+** or **22.12+** (required by Vite 8)
- A [TMDB API key](https://www.themoviedb.org/settings/api) (free)
- A [Firebase project](https://console.firebase.google.com) (free Spark plan)

### 1. Install

```bash
git clone https://github.com/your-username/moviedex.git
cd moviedex
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in your values — see the [Environment Variables](#-environment-variables)
section below.

### 3. Run locally

```bash
npm run dev
```

Open http://localhost:5173.

> **Local dev note:** keep `VITE_USE_TMDB_PROXY=false` locally so the app calls
> TMDB directly with your `VITE_TMDB_API_KEY`. The serverless proxy only runs
> on Vercel (or `vercel dev`).

---

## 🔑 Environment Variables

All variables are documented in [`.env.example`](.env.example).
**Never commit your real `.env`** — it is gitignored.

| Variable | Required | Where | Description |
| --- | --- | --- | --- |
| `VITE_TMDB_API_KEY` | Local dev only | Local `.env` | TMDB key for direct calls when the proxy is off. |
| `VITE_TMDB_BASE_URL` | No | — | TMDB API base URL (defaults to `https://api.themoviedb.org/3`). |
| `VITE_TMDB_IMAGE_BASE` | No | — | TMDB image base URL (defaults to `https://image.tmdb.org/t/p`). |
| `TMDB_API_KEY` | Production | Vercel env (server-only) | TMDB key used by the serverless proxy. **Never a `VITE_` var.** |
| `VITE_USE_TMDB_PROXY` | Production | Vercel env | `true` to route all TMDB calls through `/api/tmdb`; `false` for local dev. |
| `VITE_TMDB_PROXY_URL` | No | — | Proxy URL override (defaults to same-origin `/api/tmdb`). |
| `VITE_FIREBASE_API_KEY` | Yes | Both | Firebase web app API key. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Both | Firebase auth domain (`<project>.firebaseapp.com`). |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Both | Firebase project ID. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Both | Firebase messaging sender ID. |
| `VITE_FIREBASE_APP_ID` | Yes | Both | Firebase web app ID. |

> 🔒 **Why the split?** `VITE_*` values are inlined into the JS bundle and are
> public by design (Firebase web config is safe to expose — real protection
> comes from the Firestore rules). `TMDB_API_KEY` (no prefix) only exists in
> the serverless function at runtime, so it never reaches the browser.

### Firebase setup

1. Create a project at https://console.firebase.google.com.
2. **Authentication → Sign-in method** — enable **Email/Password** and (optionally) **Google**.
3. **Firestore Database** — create a database, then open the **Rules** tab and
   publish the contents of [`firestore.rules`](firestore.rules). The rules
   restrict every user to their own `users/{uid}` profile, My List, history,
   and notifications — everything else is denied.

---

## 🧪 Available Scripts

| Command             | Description                                    |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start the Vite dev server with HMR             |
| `npm run build`     | Build the production bundle into `dist/`       |
| `npm run preview`   | Preview the production build locally           |
| `npm run lint`      | Run Oxlint over the codebase                   |

---

## 📁 Project Structure

```
moviedex/
├── api/
│   └── tmdb.js              # TMDB key proxy (Vercel serverless function)
├── public/                  # Static assets (favicon, logo, backdrop)
├── src/
│   ├── components/
│   │   ├── auth/            # Login visuals, protected-route guard
│   │   ├── common/          # Loader, ErrorBoundary, ScrollRow, SparkleTrail…
│   │   ├── detail/          # Cast, Crew, Gallery, WatchProviders…
│   │   ├── hero/            # Landing / home hero banners
│   │   ├── home/            # Continue Watching row
│   │   ├── layout/          # AuthLayout, Sidebar, TopBar, Footer
│   │   ├── movie-card/      # MovieCard + skeleton + scroll row
│   │   ├── navbar/          # Public navbar
│   │   └── player/          # In-app preview video player
│   ├── contexts/            # Auth + Watchlist React contexts
│   ├── hooks/               # useTMDB data-fetching hook
│   ├── pages/               # All routes (Home, Movies, TV, Anime, Detail…)
│   ├── routes/              # Router config + code splitting
│   ├── services/            # Firebase, TMDB (proxy-aware), history, playback…
│   └── styles/              # Global design tokens & layout CSS
├── .env.example             # Documented env variables (copy to .env)
├── firestore.rules          # Per-user Firebase security rules
├── vercel.json              # SPA rewrites + security headers
└── package.json
```

---

## ☁️ Deployment (Vercel)

1. Push the repo to GitHub and import it on [Vercel](https://vercel.com)
   (framework auto-detected as **Vite**, output dir `dist`).
2. Add the environment variables listed above — **Production** environment.
3. Deploy. Every push to `main` auto-deploys.

`vercel.json` already provides:
- **SPA rewrites** — deep links like `/movie/550` or `/settings` load on refresh.
- **Security headers** — `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy` on every response.
- The `/api/tmdb` function is auto-detected from the `api/` folder.

**First-deploy checklist:**
- [ ] TMDB proxy responds at `/api/tmdb?path=/movie/popular` with JSON.
- [ ] Your TMDB key does **not** appear anywhere in the JS bundle (DevTools → Sources).
- [ ] Firestore rules published; sign up a test account and confirm My List persists.
- [ ] Deep links (`/movie/550`, `/settings`, …) don't 404 on refresh.

---

## 🗺️ Roadmap

- [ ] Trending & Genres pages (currently "coming soon" placeholders)
- [ ] Ratings & reviews
- [ ] Notifications for new episodes
- [ ] PWA / offline support
- [ ] i18n (multi-language UI)

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository and create a feature branch (`git checkout -b feat/amazing-idea`).
2. Make your changes — keep them focused, follow the existing code style.
3. Run `npm run lint` and `npm run build` and make sure both pass.
4. Open a **Pull Request** describing what you changed and why.

Please keep PRs small and self-contained so they're easy to review.

---

## 📄 License

Released under the **MIT License**. You are free to use, modify and distribute
this project — just include the original copyright notice.

> Tip: add a `LICENSE` file with the full MIT license text and your name before
> publishing the repository publicly.

---

## 🙏 Acknowledgements

- [The Movie Database (TMDB)](https://www.themoviedb.org) for the data and imagery.
- [Firebase](https://firebase.google.com) for auth and data storage.
- [GSAP](https://gsap.com) and [Three.js](https://threejs.org) for the visuals.
- Built with [React](https://react.dev) and [Vite](https://vite.dev).

---

*Made with 🍿 and a love for cinema.*
