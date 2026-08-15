# 🎬 MovieDex 🍿

> 🌌 A premium, dark-themed cinematic discovery platform.
> Your portal to movies, TV shows, and anime — powered by **The Movie Database (TMDB)** & **Firebase**. 🚀

Welcome to **MovieDex**! Step into a luxe "noir cinema" experience featuring cinematic hero scenes, buttery smooth animations, and a rich crimson/gold aesthetic. 🎭

---

## 🌐 Live Demo

**https://moviedex-zeta.vercel.app/**

---

## 📖 About

MovieDex is a **movie & TV discovery platform** with a complete product flow:

```text
Discover  →  Search / Browse  →  Explore  →  Movie / TV Details  →  Watchlist / Favorites
```

Browse trending, popular, and top-rated titles across movies, TV shows, and anime; dive into rich detail pages (cast, crew, trailers, watch providers, seasons & episodes); and curate a private, account-synced **My List** — all in one polished, responsive experience.

> **Note:** MovieDex does not host or stream content. All metadata, imagery, and trailer links come from the TMDB API; the in-app "preview" player is a clearly-labeled preview of publicly available sources.

---

## ✨ Features

- 🎥 **Cinematic discovery** — trending, popular, top-rated, now playing, and upcoming rows on a GSAP-animated home page with an auto-rotating hero.
- 🔍 **Powerful search** — debounced multi-search across movies, TV shows, anime, and people, with live suggestions in the navbar, type filters, pagination, and recent-searches memory.
- 📋 **Detail pages** — cast & crew, trailers (in-app modal), watch providers, release dates, content ratings, collections, keywords, reviews, similar titles, and full **seasons & episodes** browsing for TV/anime.
- 🗂️ **My List** — add/remove titles instantly, guest support via `localStorage` with automatic migration to your account on sign-in, and a tabbed collection page.
- 🔐 **Secure by design** — TMDB API key stays server-side behind a Vercel serverless proxy; Firebase Firestore rules isolate every user's data.
- ⚡ **Polished UX** — skeleton loaders, image fallbacks, error/empty states, toast feedback, reduced-motion support, keyboard navigation, and fully responsive layouts (320px → 1920px).

---

## 🛠️ Tech Stack

- ⚛️ **React 19** + ⚡ **Vite 8**
- 🛣️ **React Router 7** (route-level code splitting)
- 🎨 **Tailwind CSS 4** + a custom design-token system (`globals.css`)
- ✨ **GSAP** & 🧊 **Three.js** (landing-page animations)
- 🔥 **Firebase** (Authentication + Firestore)
- ☁️ **Vercel** (hosting + serverless API proxy)

---

## 📸 Screenshots

*Screenshots go here — add `assets/screenshots/*.png` and reference them in this section.*

---

## 🏗️ Architecture

```
src/
├── pages/            # Route-level pages (lazy-loaded)
├── components/
│   ├── layout/       # Navbar, Footer, AuthLayout
│   ├── movie-card/   # MovieCard, MovieRow, skeletons
│   ├── hero/         # HeroBanner (home), HeroSection (landing)
│   ├── detail/       # CastRow, CrewSection, WatchProviders, Reviews, Gallery…
│   └── common/       # ErrorBoundary, ScrollRow, ScrollToTop…
├── contexts/         # Auth, Watchlist, Toast (React context)
├── hooks/            # useTMDB, usePaginatedTMDB, usePageTitle…
├── services/         # tmdb.js (API layer), tmdbQueue, tmdbCache, firebase, myList…
├── routes/           # AppRouter — all routes + 404
└── styles/           # globals.css (design tokens), layout.css
api/tmdb.js           # Vercel serverless proxy — keeps the TMDB key server-side
```

Key design decisions:

- **Centralized API layer** (`services/tmdb.js`) — all TMDB calls go through a cache + dedup queue and return a normalised `MediaItem` shape; UI components never call TMDB directly.
- **State management** — lightweight React context only (no Redux). Watchlist supports guest (`localStorage`) → authenticated (Firestore) with automatic migration.
- **Loading/error/empty** — every data-driven surface has skeletons, retryable error states, and designed empty states.
- **Performance** — route code splitting, debounced search, image `srcSet`/`loading="lazy"`, and preloaded hero backdrops.

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in your values:

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_TMDB_API_KEY` | Local dev only | TMDB API key for direct calls when the proxy is off |
| `VITE_TMDB_BASE_URL` | Optional | TMDB API base URL (defaults to `https://api.themoviedb.org/3`) |
| `VITE_TMDB_IMAGE_BASE` | Optional | TMDB image CDN base |
| `VITE_TMDB_LANGUAGE` | Optional | Response language (default `en-US`) |
| `VITE_TMDB_REGION` | Optional | Region for availability filters (default `IN`) |
| `TMDB_API_KEY` | Production | Server-side TMDB key used by `api/tmdb.js` — never shipped to the browser |
| `VITE_USE_TMDB_PROXY` | Production | Set `true` to route all TMDB calls through the serverless proxy |
| `VITE_TMDB_PROXY_URL` | Optional | Override proxy URL (defaults to same-origin `/api/tmdb`) |
| `VITE_FIREBASE_API_KEY` | Yes | Firebase web app config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase web app config |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase web app config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase web app config |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase web app config |

**Security:** `.env` is git-ignored. `VITE_*` variables are inlined by Vite — never put secrets there. Use `TMDB_API_KEY` (serverless proxy) for production keys.

---

## 🚀 Installation & Running Locally

### 1️⃣ Clone & Install

```bash
git clone https://github.com/your-username/moviedex.git
cd moviedex
npm install
```

### 2️⃣ Environment Setup

```bash
cp .env.example .env
```

Add your TMDB and Firebase keys to the `.env` file. For local dev keep `VITE_USE_TMDB_PROXY=false` (the Vite dev server doesn't run serverless functions).

### 3️⃣ Action! 🎬

```bash
npm run dev
```

Open `http://localhost:5173` and grab your popcorn! 🍿

### Production build

```bash
npm run build   # production build → dist/
npm run lint    # oxlint checks
npm run preview # preview the production build
```

---

## 🔌 API & Attribution

- **TMDB API** — all movie/TV/anime metadata, images, and trailers: [themoviedb.org](https://www.themoviedb.org)
- **Firebase** — authentication and Firestore for My List & settings
- **YouTube** — trailer playback embeds

> This product uses the TMDB API but is not endorsed or certified by TMDB.

---

## 🔮 Future Improvements

- [ ] Personalized recommendations based on watch history
- [ ] Social features — public lists & friend activity
- [ ] Episode-by-episode watch progress sync
- [ ] More regions/languages for watch providers
- [ ] PWA support (offline caching)

---

## 🤝 Join the Crew (Contributing)

Want to make MovieDex even better? 🌟

1. Fork it 🍴
2. Create your feature branch 🌿
3. Make your magic happen ✨
4. Open a Pull Request 💌

---

*Made with 🍿 and a love for cinema.* 🎬
