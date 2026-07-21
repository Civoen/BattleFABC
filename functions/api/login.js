/* Cloudflare Pages Function — POST /api/login
   Checks a submitted password against the ADMIN_PASSWORD environment
   variable (set in the Cloudflare Pages dashboard, never committed to the
   repo). Used only to give the admin gate immediate pass/fail feedback —
   every actual write to /api/data is re-checked against the same secret
   server-side, so this endpoint being called correctly is not itself a
   security boundary. */

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD) {
    return json({ ok: false, error: 'ADMIN_PASSWORD is not configured on the server.' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ ok: false, error: 'Invalid request body.' }, 400);
  }

  if (body && body.password === env.ADMIN_PASSWORD) {
    return json({ ok: true });
  }
  return json({ ok: false, error: 'Incorrect password.' }, 401);
}

export async function onRequestGet() {
  return json({ ok: false, error: 'Use POST.' }, 405);
}
