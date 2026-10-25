# HomeFind Frontend (React + Vite + Tailwind)

The HomeFind real-estate site (your Figma design, wired to the backend API). Requires Node 20+.
This app is separate from the backend; it only talks to it over HTTP (`/api/...`).

## Run (development)

1. **Start the backend first** (see the `homefind-backend` project): `uvicorn app.main:app --reload --port 8000`
2. Then here:

```bash
npm install
npm run dev
```

Open http://localhost:8443. In development, requests to `/api` are proxied to `http://localhost:8000`
(change with `VITE_PROXY_TARGET`). If the backend is down, sections show an error banner with a Retry button.

> **Windows PowerShell:** if `npm` is blocked, run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`,
> or use `npm.cmd install` / `npm.cmd run dev`, or use Command Prompt.

## Build for production

```bash
# point the build at your deployed API
echo VITE_API_URL=https://api.your-domain.com > .env.local     # PowerShell/cmd also work with this line
npm run build        # outputs ./dist (static files, host anywhere)
npm run preview      # optional local preview of the build
```

Then add your site's URL to the backend's `CORS_ORIGINS`, or host both on one domain behind a reverse proxy
that forwards `/api` to the backend (then `VITE_API_URL` can stay empty).

## Structure

| File | Purpose |
|---|---|
| `src/App.tsx` | Page layout and search/filter logic |
| `src/api.ts` | Typed API client (token handling, error messages) |
| `src/state.tsx` | Auth, saved homes, toasts |
| `src/modals.tsx` | Sign in/join, contact agent, property details, mortgage tools, app alerts |
| `src/PropertyCard.tsx`, `AgentCard.tsx`, `Footer.tsx` | Design components |
| `src/types.ts` | API types |
| `public/assets/` | Images from the design |

Note: the layout is the fixed 1440px desktop design exported from Figma (not responsive yet).
