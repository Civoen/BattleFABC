/* Cloudflare Pages Function — /api/vote
   Public endpoint (no admin password) so any visitor can vote. Limits each
   visitor to one active vote at a time, tracked by IP address:
     - Voting for a new game while you have no vote: counts a vote.
     - Clicking the game you already voted for: removes your vote (unvote).
     - Clicking a different game while you have a vote: moves your vote
       (decrements the old game, increments the new one).

   IMPORTANT CAVEAT (documented for whoever configures this): IP-based
   limiting is a practical deterrent, not a real identity check. Visitors
   sharing a network (offices, schools, mobile carriers, VPNs) share an IP,
   so this can occasionally block a legitimate second voter on the same
   network, or be bypassed by anyone switching networks/VPNs. It stops
   casual repeat-clicking and simple scripts, nothing more.

   GET  -> { ok:true, gameId: <this visitor's current vote, or null> }
   POST body { gameId } -> casts/switches/removes the vote, returns the
   updated games array so the page can re-render counts immediately. */

const GAMES_KEY = 'fabc:games';

// Mirrors js/data.js's FABC_GAMES. Only used to seed KV the very first time
// anyone votes, if the admin hasn't saved a games list yet. Keep in sync if
// the default game list changes.
const DEFAULT_GAMES = [
  { id:'valorant', name:'Valorant', teamSize:5, blurb:'5v5 tactical shooter — precision, comms, and clutch rounds.', votes: 412, art:'linear-gradient(135deg,#2166C6,#154385)' },
  { id:'rocket-league', name:'Rocket League', teamSize:3, blurb:'Cars. Rockets. A ball. Pure chaotic joy at 100mph.', votes: 356, art:'linear-gradient(135deg,#12B8A6,#2166C6)' },
  { id:'overwatch', name:'Overwatch 2', teamSize:5, blurb:'Hero shooter mayhem — synergy wins fights.', votes: 298, art:'linear-gradient(135deg,#1B84E7,#154385)' },
  { id:'super-smash', name:'Super Smash Bros.', teamSize:1, blurb:'1v1 platform fighter bragging rights, no items.', votes: 231, art:'linear-gradient(135deg,#55545C,#2A2A2E)' },
  { id:'league', name:'League of Legends', teamSize:5, blurb:'5v5 MOBA — objectives, drafts, and 40-minute wars.', votes: 189, art:'linear-gradient(135deg,#154385,#1B84E7)' },
  { id:'apex', name:'Apex Legends', teamSize:3, blurb:'Battle royale trios — high mobility, higher stakes.', votes: 144, art:'linear-gradient(135deg,#1569BE,#12B8A6)' },
];

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
}

function getVisitorIp(request) {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || 'unknown';
}

function voteLogKey(ip) {
  return `fabc:votelog:${ip}`;
}

export async function onRequestGet({ request, env }) {
  if (!env.FABC_KV) return json({ ok: false, error: 'FABC_KV is not bound on the server.' }, 500);
  const ip = getVisitorIp(request);
  const currentVote = await env.FABC_KV.get(voteLogKey(ip));
  return json({ ok: true, gameId: currentVote || null });
}

export async function onRequestPost({ request, env }) {
  if (!env.FABC_KV) return json({ ok: false, error: 'FABC_KV is not bound on the server.' }, 500);

  let body;
  try { body = await request.json(); } catch (e) { return json({ ok: false, error: 'Invalid request body.' }, 400); }
  const gameId = body && body.gameId;
  if (!gameId) return json({ ok: false, error: 'Missing gameId.' }, 400);

  const ip = getVisitorIp(request);
  const logKey = voteLogKey(ip);
  const currentVote = await env.FABC_KV.get(logKey);

  const gamesRaw = await env.FABC_KV.get(GAMES_KEY);
  const games = gamesRaw ? JSON.parse(gamesRaw) : JSON.parse(JSON.stringify(DEFAULT_GAMES));

  const target = games.find(g => g.id === gameId);
  if (!target) return json({ ok: false, error: 'Unknown game.' }, 400);

  let action;
  if (currentVote === gameId) {
    // clicking the game you already voted for removes your vote
    target.votes = Math.max(0, (target.votes || 0) - 1);
    await env.FABC_KV.delete(logKey);
    action = 'unvoted';
  } else {
    if (currentVote) {
      const prev = games.find(g => g.id === currentVote);
      if (prev) prev.votes = Math.max(0, (prev.votes || 0) - 1);
    }
    target.votes = (target.votes || 0) + 1;
    await env.FABC_KV.put(logKey, gameId);
    action = currentVote ? 'switched' : 'voted';
  }

  await env.FABC_KV.put(GAMES_KEY, JSON.stringify(games));
  return json({ ok: true, action, gameId: action === 'unvoted' ? null : gameId, games });
}
