/* ==========================================================================
   FABC — Editable homepage content
   Backs the "Admin" form (admin.html). Everything the admin can edit lives
   in one plain object, persisted to the shared backend (see js/api.js) under
   the "content" collection. index.html calls applyFabcContent() on load to
   paint the saved values (or these defaults) into the page.
   ========================================================================== */

const FABC_DEFAULT_CONTENT = {
  hero: {
    eyebrow: 'Online charity events and tournaments',
    sub: 'A non-profit group focused on raising money for charity. Turn your match wins into real-world impact.',
  },
  stats: {
    teams: '8',
    raised: '$8,420',
    charities: '6',
  },
  event: {
    name: 'Summer Clash 2026',
    type: 'Quarterfinals',
    teamsFilled: '8 / 16 slots filled',
    raised: 8420,
    goal: 15000,
  },
  steps: [
    { title: 'Build your squad', desc: 'Recruit your team, pick your game, and lock in your roster before registration closes.' },
    { title: 'Choose a charity', desc: 'Every team plays under the banner of an approved cause — you decide who you\'re fighting for.' },
    { title: 'Battle the bracket', desc: 'Single-elimination play across multiple rounds, all tracked live on the bracket page.' },
    { title: 'Raise real funds', desc: 'Match wins and community donations combine to push your charity\'s total higher.' },
  ],
  upcomingCards: [
    { tag: 'Schedule', title: 'Kicks off Aug 2', desc: 'Quarterfinals are already underway — semifinals begin Saturday, August 2nd at 6:00 PM ET.' },
    { tag: 'Format', title: 'Single elimination', desc: '16-team bracket across Valorant, Rocket League, Overwatch 2, Smash, League, and Apex.' },
    { tag: 'Prize', title: 'Winner\'s charity gets 2x', desc: 'The champion\'s chosen charity receives a matched donation on top of the season total.' },
  ],
  cta: {
    heading: 'Your team. Your cause. One bracket.',
    para: 'Registration for Summer Clash 2026 is open until slots fill. It takes five minutes to lock in your roster.',
  },
};

async function getFabcContent(){
  const saved = await fabcApiGet('content', null);
  if (!saved) return JSON.parse(JSON.stringify(FABC_DEFAULT_CONTENT));
  // shallow-merge so a partially-saved object (or a future new field) never breaks the page
  return {
    hero: { ...FABC_DEFAULT_CONTENT.hero, ...(saved.hero||{}) },
    stats: { ...FABC_DEFAULT_CONTENT.stats, ...(saved.stats||{}) },
    event: { ...FABC_DEFAULT_CONTENT.event, ...(saved.event||{}) },
    steps: (saved.steps && saved.steps.length === 4) ? saved.steps : FABC_DEFAULT_CONTENT.steps,
    upcomingCards: (saved.upcomingCards && saved.upcomingCards.length === 3) ? saved.upcomingCards : FABC_DEFAULT_CONTENT.upcomingCards,
    cta: { ...FABC_DEFAULT_CONTENT.cta, ...(saved.cta||{}) },
  };
}

async function saveFabcContent(content){
  return await fabcApiSave('content', content);
}

async function resetFabcContent(){
  return await fabcApiSave('content', FABC_DEFAULT_CONTENT);
}

function fmtMoney(n){
  const num = Number(n) || 0;
  return '$' + num.toLocaleString('en-US');
}

/* Paints saved content into index.html. Safe to call even if some elements
   are missing (e.g. if called from a different page). */
async function applyFabcContent(){
  const c = await getFabcContent();
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  set('fldEyebrow', c.hero.eyebrow);
  set('fldHeroSub', c.hero.sub);

  set('statTeams', c.stats.teams);
  set('statRaised', c.stats.raised);
  set('statCharities', c.stats.charities);
  set('ctaStatTeams', c.stats.teams);
  set('ctaStatRaised', c.stats.raised);
  set('ctaStatCharities', c.stats.charities);

  set('fldEventName', c.event.name);
  set('fldEventType', c.event.type);
  set('fldEventTeams', c.event.teamsFilled);
  set('fldUpcomingTitle', c.event.name);

  const pct = c.event.goal > 0 ? Math.min(100, Math.round((c.event.raised / c.event.goal) * 100)) : 0;
  set('fundraisingLabel', `Fundraising progress — ${fmtMoney(c.event.raised)} of ${fmtMoney(c.event.goal)}`);
  const fill = document.getElementById('progressFill');
  if (fill) fill.style.width = pct + '%';

  c.steps.forEach((s, i) => {
    set(`fldStep${i+1}Title`, s.title);
    set(`fldStep${i+1}Desc`, s.desc);
  });
  c.upcomingCards.forEach((card, i) => {
    set(`fldUpcCard${i+1}Tag`, card.tag);
    set(`fldUpcCard${i+1}Title`, card.title);
    set(`fldUpcCard${i+1}Desc`, card.desc);
  });

  set('fldCtaHeading', c.cta.heading);
  set('fldCtaPara', c.cta.para);
}
