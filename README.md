# Quasar — Your Universe of Sound

A Silicon-Valley-caliber music streaming frontend built with **Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn-style UI**, consuming the [music-streaming-api](https://github.com/Chrono-QuasarDev/music-streaming-api) backend.

## Quick start

```bash
npm install
cp .env.example .env.local   # then set NEXT_PUBLIC_API_URL
npm run dev                  # frontend on http://localhost:3001
```

> The backend API is expected at `http://localhost:4000` by default. Start it first (`npm start` in the backend repo), then open the frontend.

## Env

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Backend API base URL (proxied server-side) |
| `API_URL` | _(unset)_ | Optional server-only override for the backend URL |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Used to build share links |
| `NEXT_PUBLIC_APP_NAME` | `Quasar` | Brand name |

## Architecture notes

- **Same-origin API gateway** — the browser only ever talks to `/api/*` on the
  Next.js server (`/api/v1/[...path]`, `/api/health`, `/api/stream/[id]`), which
  forward to the backend. This makes the app immune to backend CORS gaps (e.g.
  `/health` currently ships without CORS headers) and keeps JWTs out of
  cross-origin requests.
- **Discovery fallback** — if `GET /api/v1/discovery/new-releases` 404s (backend
  older than the discovery module), the Home page silently falls back to the
  catalog sorted newest-first. `git pull` the backend to get true 30-day
  filtering.

## Features → Endpoints map

| Feature | Endpoint(s) |
|---|---|
| Register / Login (JWT) | `POST /api/v1/auth/register`, `POST /api/v1/auth/login` |
| My profile / Public profiles | `GET /api/v1/users/me`, `GET /api/v1/users/:id/profile` |
| Catalog + paginated lists | `GET /api/v1/songs/` (`page,size,sortBy,orderBy`) |
| Search (title/album/genre) | `GET /api/v1/songs/search` |
| Song details + streaming | `GET /api/v1/songs/:id`, `GET /api/v1/songs/:id/stream` (via `/api/stream/:id` proxy with Range support) |
| Share links | `POST /api/v1/songs/:id/share` |
| Playlists CRUD | `POST/GET /api/v1/playlists/`, `GET/PUT/DELETE /api/v1/playlists/:id` |
| Add/remove songs | `POST /api/v1/playlists/:id/songs`, `DELETE /api/v1/playlists/:id/songs/:songId` |
| Artists + follow | `GET /api/v1/artists/:id`, `POST /api/v1/artists/:id/follow` |
| Discovery (last 30 days) | `GET /api/v1/discovery/new-releases` (paginated + sortable) |
| Health indicator | `GET /health` |

## Highlights

- **Persistent global player** — queue, shuffle/repeat, playback speed, seek, volume, MediaSession OS controls, keyboard shortcuts (Space, ←/→), expanded view, queue drawer.
- **Authenticated stream proxy** (`/api/stream/:id`) — attaches the JWT server-side and forwards `Range` headers so seeking works without leaking tokens to the `<audio>` element.
- **⌘K command palette** — debounced global search + navigation.
- **Optimistic updates** — follow artists, add/remove playlist songs.
- **Graceful states everywhere** — skeletons, empty states, 404/403/401 handling, API-offline banner.
- **Deterministic artwork** — the API exposes no cover art, so the UI generates stable, beautiful gradients per song/playlist/album.

## Scripts

- `npm run dev` — dev server (use `-p 3001` to avoid clashing with the API on 3000)
- `npm run build` / `npm start` — production build & serve
- `npm run lint` — ESLint
