# MovieDex — Project Change Log

> Summary of all changes made during the premium overhaul session.
> Covers cleanup, bug fixes, UI/UX refinements, watch-provider links, and performance work.

---

## 1. 🧹 Cleanup — Removed Unused Files

These files were referenced nowhere in the codebase and are safe to delete:

| File | Reason |
| --- | --- |
| `src/assets/hero.png` | Never imported/used |
| `src/assets/vite.svg` | Vite default logo, unused |
| `public/icons.svg` | Orphaned social-icon sprite, no `<use>` references |

---

## 2. 🐛 Bug Fixes & Loopholes

### Security — hardcoded TMDB API key removed
- `src/services/tmdbConfig.js` previously shipped a **real API key** as a hardcoded fallback. It now reads only from the environment (`.env`), and fails loudly with a clear console error when missing.
- `src/services/tmdb.js` added a fail-fast guard so a missing key produces an actionable error instead of silently broken requests.

### Broken favicon
- `index.html` referenced `/favicon.svg` but the file didn't exist (404 in browser).
- Created `public/favicon.svg` — a premium clapperboard mark with the brand gradient.
- `index.html` branding + `theme-color` updated to match MovieDex.

### Auth race condition
- `src/contexts/AuthContext.jsx`: after `login()` / `signup()` / `loginWithGoogle()` resolved, `currentUser` was only set asynchronously via the `onAuthStateChanged` listener — causing `ProtectedRoute` to bounce users back to `/login`.
- Now set synchronously from the resolved credential, so redirects behave correctly.

### Dead footer links
- `src/components/common/Footer.jsx`: `/watchlist` and `/favorites` pointed to routes that don't exist → now point to `/mylist` and `/settings`.

### Hard navigation (full page reloads)
- Raw `href` anchors caused full page reloads. Converted to React Router `<Link>`:
  - `MovieRow` "View all" links
  - `LandingPage` CTA buttons ("Create Free Account", "Browse First")

### Lint warnings fixed (8 → 2)
- Unused `catch (err)` parameters in auth pages (`Login.jsx`, `Register.jsx`).
- Recursive `cacheKey` default parameter warning in `tmdbQueue.js`.
- `exhaustive-deps` ref-cleanup warning in `AuthVisual.jsx` (node captured in local variable inside the effect).
- Remaining 2 warnings are the standard React context-hook pattern (false positive).

### Branding consistency
- Standardized every remaining **"MovieHub" → "MovieDex"**: `index.html`, `.env.example`, `TopBar.jsx`, `SettingsPage.jsx`, `ProfilePage.jsx`, `notifications.js`, `userProfile.js`, `playback.js`, `VideoPlayer.jsx`.

---

## 3. 💎 Premium UI / UX

### Design tokens (`src/styles/globals.css`)
- Deeper "Luxe Noir" background layer with subtle violet undertone.
- Richer **crimson → rose → gold** brand gradient (replaces old indigo/blue identity).
- Softer, diffused accent glows + a luxe drop shadow token.

### Global polish
- Ambient radial glow on the page body.
- Brand-tinted text selection color.
- Visible `focus-visible` rings (accessibility).
- Gradient scrollbars.
- Buttons: sheen highlight on hover, proper disabled state.
- Glass cards: gradient fill + soft glow on hover.
- Sidebar active state, tab styles, hero dots, and search focus refined.

### Color-consistency sweep
- Replaced leftover indigo/purple accents (`rgba(99,102,241)`, `#a855f7`, `#8b5cf6`, `#c7d2fe`, `#6366f1`) with brand gold/crimson across:
  `MovieCard.jsx`, `MovieRow.jsx`, `ContinueWatchingRow.jsx`, `CinematicBackground.jsx`, `DetailPage.jsx`, `WatchProviders.jsx`, `ProfilePage.jsx`, `HeroSection.jsx`.
- Hardcoded hexes aligned with CSS tokens in auth pages, `TopBar.jsx` dropdowns, `SettingsPage.jsx` modals, and `VideoPlayer.jsx`.

### Landing page — black cinematic shade
- **Background image (`/cinema-bg.jpg`) is unchanged.**
- The blue/pink color washes over it were replaced with **black shade overlays**:
  - `CinematicBackground.jsx`: the pink/gold radial gradients are now a pure-black vignette that frames the photo in deep black (image stays visible in the center).
  - `HeroSection.jsx`: pink title glow → black glow; navy (bluish) secondary button → neutral near-black.
  - `LandingPage.jsx`: features-section pink wash → black gradient; CTA pink/gold glow → black radials; animated CTA hairline → subtle white.

---

## 4. 🎬 Real Watch-Provider Links & Episode Previews

> TMDB is metadata-only and cannot host copyrighted video. In-app playback is therefore **demo content**, clearly labeled, while real viewing happens through official providers.

### `src/services/tmdb.js` — new helpers
- `pickWatchRegion()` — region detection (US → IN → GB → CA → AU).
- `buildProviderWatchUrl()` — builds the per-provider TMDB watch page URL.
- `getTopStreamingProvider()` — picks the top streaming provider for a title.

### `src/components/detail/WatchProviders.jsx`
- Every provider chip (Stream / Rent / Buy) is now a **clickable link** that opens the real provider's page on TMDB (which redirects to Netflix, Prime, etc.) in a new tab, with `rel="noopener"`.

### `src/pages/DetailPage.jsx`
- Primary CTA is now **"▶ Watch on [Provider]"** (e.g. Netflix) linking out to the real service.
- Secondary **"Preview Movie / Preview Episode"** button opens the in-app player with demo content.
- Episode play buttons honestly relabeled to **"Preview Episode"**.

### Preview player
- `playback.js`: demo source now returns `isPreview: true` with documentation.
- `VideoPlayer.jsx`: gold **PREVIEW** badge + "MovieDex Preview" label so demo content is never mistaken for a real stream.
- `ContinueWatchingRow` picks up the preview labeling automatically (shared `getPlaybackSource`).

---

## 5. ⚡ Performance — Route-Level Code Splitting

- `src/routes/AppRouter.jsx`: all routes now use `React.lazy` + `Suspense` with a branded loading fallback.
- **Initial bundle: 1,628 kB → 893 kB.**
- The 527 kB `three.js` chunk now loads only on the auth pages that use it.

---

## 6. ✅ Verification

| Check | Result |
| --- | --- |
| `npm run lint` | 0 errors (2 benign context-hook warnings) |
| `npm run build` | Passes |
| Dev server smoke test | All modified modules compile, favicon resolves (was 404) |

---

## 7. 🎥 Cinematic Detail-Page Upgrade (TMDB)

Extended the Movie / TV / Anime detail experience without touching the existing hero, auth, My List, search, seasons/episodes, trailer player, or navigation.

### TMDB service (`src/services/tmdb.js`)
- New normalised fields: `imdbId`, `homepage`, `createdBy`, `originCountries`, `images`, `externalIds`.
- Movie & TV detail calls now append `images,external_ids` (fewer round-trips).
- New endpoints: `getMovieImages`, `getTVImages`, `discoverMovies`, `discoverTV`, `getPersonDetails`, `searchPeople`, `normalisePerson`.
- Episodes now carry `guestStars`, `crew`, `productionCode`.

### New detail sections (`DetailPage.jsx`)
- **Quick Stats** — compact stat strip (Rating, Votes, Popularity, Runtime, Release, Status).
- **Crew** — dedicated section grouping important departments (Directing, Writing, Production, Camera, Editing, Sound…) with person links.
- **Gallery** — backdrops / posters / logos with filter tabs, lazy loading, hover zoom, a "View All" toggle, and a full lightbox (Escape / arrows / backdrop click).
- **External Links** — IMDb, Official Website, TMDB (opens safely in new tabs).
- **Production logos** — company logo chips inside the Details block, with text fallback.
- **Clickable genres** — pills now link to `/movies?genre=28` / `/tv?genre=…`.
- **Episode stills** — fallback chain: episode still → season poster → series backdrop.
- **Episode detail panel** — now also shows production code, guest stars, and episode crew (fetched from the dedicated episode endpoint).

### People
- **`/person/:id`** route + `PersonPage` — photo, biography (expandable), birthday, place of birth, known-for department, popularity, also-known-as, external links, and a "Known For" filmography grid.
- Cast cards, crew cards, and episode guest-stars/crew chips all link to the person page.

### Search (`SearchPage.jsx`)
- Debounced search (400 ms) while typing.
- **People results** with 👤 avatars linking to `/person/:id`.
- Results header shows type counts: 🎬 movies · 📺 shows.

### Browse (`MoviesPage.jsx`, `TVPage.jsx`)
- Genre filter pills + sort dropdown (Most Popular / Top Rated / Newest / Biggest Grossing) backed by TMDB **discover**.
- Genre deep-links from detail pages now land on a filtered grid.

### Verified
- `npm run lint` — 0 errors (2 pre-existing benign warnings).
- `npm run build` — passes.
- Dev server — all new modules compile (HTTP 200).

---

*Generated with Codebuff 🤖*
