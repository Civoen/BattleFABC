/* Cloudflare Pages Function — /api/data?collection=<name>
   This is the shared backend for FABC's admin panel. Reads/writes one JSON
   blob per collection to a Workers KV namespace bound as FABC_KV. Every
   visitor's GET reads the same KV value, so admin edits become visible to
   everyone — not just the browser that made them.

   Required setup in the Cloudflare Pages project (see README.md):
     - A KV namespace bound to this Pages project as "FABC_KV"
     - An environment variable "ADMIN_PASSWORD" (Production + Preview)

   Collections: content, teams, matches, games, charities
   GET  -> { ok: true, data: <stored JSON, or null if never saved> }
   POST -> body { password, data } ; writes data under this collection's key
           if password matches ADMIN_PASSWORD, else 401. */

const ALLOWED_COLLECTIONS = ['content', 'teams', 'matches', 'games', 'charities'];

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function kvKey(collection) {
  return `fabc:${collection}`;
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const collection = url.searchParams.get('collection');

  if (!ALLOWED_COLLECTIONS.includes(collection)) {
    return json({ ok: false, error: `Unknown collection "${collection}".` }, 400);
  }
  if (!env.FABC_KV) {
    return json({ ok: false, error: 'FABC_KV namespace is not bound on the server.' }, 500);
  }

  const raw = await env.FABC_KV.get(kvKey(collection));
  return json({ ok: true, data: raw ? JSON.parse(raw) : null });
}

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const collection = url.searchParams.get('collection');

  if (!ALLOWED_COLLECTIONS.includes(collection)) {
    return json({ ok: false, error: `Unknown collection "${collection}".` }, 400);
  }
  if (!env.FABC_KV) {
    return json({ ok: false, error: 'FABC_KV namespace is not bound on the server.' }, 500);
  }
  if (!env.ADMIN_PASSWORD) {
    return json({ ok: false, error: 'ADMIN_PASSWORD is not configured on the server.' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ ok: false, error: 'Invalid request body.' }, 400);
  }

  if (!body || body.password !== env.ADMIN_PASSWORD) {
    return json({ ok: false, error: 'Unauthorized.' }, 401);
  }
  if (body.data === undefined) {
    return json({ ok: false, error: 'Missing "data" in request body.' }, 400);
  }

  await env.FABC_KV.put(kvKey(collection), JSON.stringify(body.data));
  return json({ ok: true });
}
