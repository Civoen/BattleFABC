# For A Better Cause — deployment guide

This site is plain static HTML/CSS/JS plus a small serverless backend
(Cloudflare Pages Functions + Workers KV) that makes Admin panel edits
visible to every visitor, not just the browser that made them.

## 1. Push to GitHub

Push this whole folder to a GitHub repo (keep the folder structure as-is —
`functions/` must stay at the repo root, alongside `index.html`).

## 2. Connect the repo to Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**.
2. Pick your repo.
3. Build settings: **Framework preset: None**, **Build command: (leave
   blank)**, **Build output directory: `/`** (the repo root — this is a
   static site, nothing to build).
4. Deploy. Cloudflare will pick up everything in `functions/` automatically
   — no extra config needed for the API routes themselves.

## 3. Create a KV namespace and bind it

1. Dashboard → **Workers & Pages** → **KV** → **Create namespace**. Name it
   anything, e.g. `fabc-content`.
2. Go to your Pages project → **Settings** → **Functions** → **KV namespace
   bindings** → **Add binding**.
   - Variable name: **`FABC_KV`** (must match exactly — this is what
     `functions/api/data.js` reads).
   - KV namespace: the one you just created.
3. Save, then redeploy (or just wait for the binding to apply — Pages
   usually applies it to the next deployment/request).

## 4. Set the admin password

1. Same Pages project → **Settings** → **Environment variables**.
2. Add a variable named **`ADMIN_PASSWORD`** with whatever password you
   want, for **both** Production and Preview environments.
3. This is what gates the `/admin.html` panel — it's never stored in the
   repo, so you can change it any time from the dashboard without a new
   deploy.

That's it — once both the KV binding and `ADMIN_PASSWORD` are set, every
save made in `/admin.html` writes to that KV namespace, and every visitor's
page load reads from it. Edits are shared, not per-browser.

## How it works

- `functions/api/login.js` — checks a submitted password against
  `ADMIN_PASSWORD`. Used only for the admin gate's pass/fail feedback.
- `functions/api/data.js` — the admin-only API. `GET /api/data?collection=<name>`
  reads a JSON blob from KV; `POST` (with the password in the body)
  overwrites it. Collections: `content`, `teams`, `matches`, `games`,
  `charities`.
- `functions/api/vote.js` — the **public** voting API (no password). Each
  visitor is limited to one active vote at a time, tracked by IP address:
  voting fresh counts a vote, clicking your own current vote removes it, and
  voting for a different game moves your vote. See the caveat below.
- `js/api.js` — the only file that calls `fetch()` against `/api/*`.
- `js/data.js` / `js/content.js` — load defaults from the bundled mock data,
  then let the API override them if something's been saved.

If the KV binding or password isn't configured yet, the site still works —
pages just fall back to the bundled example data, and the admin panel will
show a clear error on save/login instead of failing silently.

## Local testing (optional)

If you have Node installed:

```
npm install -g wrangler
cd fabc-website
wrangler pages dev . --kv=FABC_KV --binding ADMIN_PASSWORD=donut
```

This runs the whole site (static files + the API functions + a local KV
store) at `http://localhost:8788`, so you can test admin edits before ever
touching Cloudflare's dashboard.

## Vote abuse — what's protected and what isn't

Votes are limited per-IP-address (tracked server-side in KV, not just a
browser flag, so clearing cookies doesn't help). Concretely:

- Voting for a game you haven't voted for: counts your vote.
- Clicking the game you already voted for: removes your vote.
- Voting for a different game while you have one: moves your vote (old
  game -1, new game +1) — so it's always at most one active vote per IP.

This stops casual repeat-clicking and simple scripts, but it's **not** a
real identity check:
- People sharing a network (office, school, coffee shop, mobile carrier)
  share an IP, so occasionally a second real voter on the same network will
  find they're "already voted" (really, someone else on their network was).
- Anyone using a VPN or proxy can get a "new" IP and vote again.

If you want stronger protection against scripted/bot voting on top of this,
Cloudflare Turnstile (a free, usually-invisible challenge widget) is the
natural next step — it wasn't added here since it needs a bit of one-time
setup in the dashboard (create a Turnstile widget, get a site key + secret
key), but it's a small addition if you want it later.
