/* ==========================================================================
   FABC — API client
   Thin wrapper around fetch() for the /api/* Cloudflare Pages Functions.
   Every other script talks to the backend only through these functions, so
   swapping hosting/backends later means editing this file only.
   ========================================================================== */

const FABC_API_BASE = '/api';
const FABC_ADMIN_SESSION_KEY = 'fabc_admin_pw'; // sessionStorage only — cleared when the tab closes

/* GET a collection. Always resolves — falls back to `fallback` on any
   network error, 404 (API not deployed yet), or empty/never-saved value, so
   the site still works before the backend is set up. */
async function fabcApiGet(collection, fallback) {
  try {
    const res = await fetch(`${FABC_API_BASE}/data?collection=${encodeURIComponent(collection)}`);
    if (!res.ok) return fallback;
    const body = await res.json();
    return (body && body.ok && body.data != null) ? body.data : fallback;
  } catch (e) {
    console.error('FABC API GET failed:', collection, e);
    return fallback;
  }
}

/* Save a collection. Requires the admin password, checked server-side.
   Reads the password from sessionStorage (set after a successful
   fabcApiLogin) unless one is passed explicitly. */
async function fabcApiSave(collection, data, password) {
  const pw = password != null ? password : (sessionStorage.getItem(FABC_ADMIN_SESSION_KEY) || '');
  try {
    const res = await fetch(`${FABC_API_BASE}/data?collection=${encodeURIComponent(collection)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw, data }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: body.error || `Save failed (${res.status})` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: 'Network error — could not reach the server.' };
  }
}

/* Checks a password against the server and, if correct, remembers it for
   this browser tab's session so subsequent saves don't re-prompt. */
async function fabcApiLogin(password) {
  try {
    const res = await fetch(`${FABC_API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.ok) {
      sessionStorage.setItem(FABC_ADMIN_SESSION_KEY, password);
      return { ok: true };
    }
    return { ok: false, error: body.error || 'Incorrect password.' };
  } catch (e) {
    return { ok: false, error: 'Network error — could not reach the server.' };
  }
}

function fabcApiLogout() {
  sessionStorage.removeItem(FABC_ADMIN_SESSION_KEY);
}

/* --- public voting (no password needed) --- */

async function fabcApiGetMyVote() {
  try {
    const res = await fetch(`${FABC_API_BASE}/vote`);
    if (!res.ok) return { ok: false, gameId: null };
    const body = await res.json();
    return { ok: !!body.ok, gameId: body.gameId || null };
  } catch (e) {
    return { ok: false, gameId: null };
  }
}

async function fabcApiCastVote(gameId) {
  try {
    const res = await fetch(`${FABC_API_BASE}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: body.error || `Vote failed (${res.status})` };
    return { ok: true, action: body.action, gameId: body.gameId, games: body.games };
  } catch (e) {
    return { ok: false, error: 'Network error — could not reach the server.' };
  }
}
