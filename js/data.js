/* ==========================================================================
   FABC — Mock Data Layer
   In a production build this module would be replaced with fetch() calls to
   a real API (e.g. /api/teams, /api/matches). Every other script only talks
   to the FABC_DATA object / helper functions below, so swapping the backend
   later means editing this file only.
   ========================================================================== */

const FABC_COLORS = ['#2166C6', '#1B84E7', '#12B8A6', '#154385', '#55545C', '#0A8A7C', '#1569BE', '#1A54A3'];
function colorFor(seed){
  let h = 0;
  for (let i=0;i<seed.length;i++) h = seed.charCodeAt(i) + ((h<<5)-h);
  return FABC_COLORS[Math.abs(h) % FABC_COLORS.length];
}
function initials(name){
  return name.split(/\s+/).map(w=>w[0]).join('').slice(0,3).toUpperCase();
}

const FABC_GAMES = [
  { id:'valorant', name:'Valorant', teamSize:5, blurb:'5v5 tactical shooter — precision, comms, and clutch rounds.', votes: 412, art:'linear-gradient(135deg,#2166C6,#154385)' },
  { id:'rocket-league', name:'Rocket League', teamSize:3, blurb:'Cars. Rockets. A ball. Pure chaotic joy at 100mph.', votes: 356, art:'linear-gradient(135deg,#12B8A6,#2166C6)' },
  { id:'overwatch', name:'Overwatch 2', teamSize:5, blurb:'Hero shooter mayhem — synergy wins fights.', votes: 298, art:'linear-gradient(135deg,#1B84E7,#154385)' },
  { id:'super-smash', name:'Super Smash Bros.', teamSize:1, blurb:'1v1 platform fighter bragging rights, no items.', votes: 231, art:'linear-gradient(135deg,#55545C,#2A2A2E)' },
  { id:'league', name:'League of Legends', teamSize:5, blurb:'5v5 MOBA — objectives, drafts, and 40-minute wars.', votes: 189, art:'linear-gradient(135deg,#154385,#1B84E7)' },
  { id:'apex', name:'Apex Legends', teamSize:3, blurb:'Battle royale trios — high mobility, higher stakes.', votes: 144, art:'linear-gradient(135deg,#1569BE,#12B8A6)' },
];

const FABC_CHARITIES = [
  { id:'gamers-outreach', name:'Gamers Outreach', category:'Pediatric Care', desc:'Delivers gaming carts and consoles to hospitalized kids across North America.', url:'https://gamersoutreach.org', location:'Ann Arbor, MI' },
  { id:'ablegamers', name:'AbleGamers', category:'Accessibility', desc:'Builds custom adaptive controllers so gamers with disabilities can play on their own terms.', url:'https://ablegamers.org', location:'Harpers Ferry, WV' },
  { id:'extra-life', name:'Extra Life', category:'Pediatric Care', desc:'Community game-a-thons raising funds for Children\u2019s Miracle Network Hospitals.', url:'https://www.extra-life.org', location:'Glendale, AZ' },
  { id:'stack-up', name:'Stack-Up', category:'Veterans', desc:'Supports active-duty service members and veterans through gaming and care packages.', url:'https://stack-up.org', location:'Fort Worth, TX' },
  { id:'child-play', name:'Child\u2019s Play', category:'Pediatric Care', desc:'Donates games, toys, and tech to children\u2019s hospitals worldwide.', url:'https://childsplaycharity.org', location:'Seattle, WA' },
  { id:'wigi', name:'Women In Games Intl.', category:'Industry Equity', desc:'Advances economic equality and diversity for women in the games industry.', url:'https://www.womeningamesinternational.org', location:'Remote / Global' },
];

// Registered teams (roster). captainIdx references the players array.
const FABC_TEAMS = [
  { id:'t1', name:'Nova Vanguard', game:'valorant', charity:'gamers-outreach', status:'confirmed', players:['Astra_K','ByteRunner','Quinnzel','Fen.exe','ov3rclock'], captainIdx:0 },
  { id:'t2', name:'Pixel Pirates', game:'rocket-league', charity:'child-play', status:'confirmed', players:['Cptn.Hex','SaltySeas','Boostjunkie'], captainIdx:1 },
  { id:'t3', name:'Emberwatch', game:'overwatch', charity:'stack-up', status:'confirmed', players:['Tank_Junko','HealTilDawn','FlickShotFio','MercyMain_','DVA_or_bust'], captainIdx:3 },
  { id:'t4', name:'Glitch Kingdom', game:'valorant', charity:'ablegamers', status:'confirmed', players:['ZeroDay','Rune.exe','Halcyon','LagSpike_','NullPtr'], captainIdx:2 },
  { id:'t5', name:'The Comeback Kids', game:'super-smash', charity:'extra-life', status:'confirmed', players:['DownB_Diva'], captainIdx:0 },
  { id:'t6', name:'Copper Company', game:'apex', charity:'wigi', status:'confirmed', players:['CopperCap','Ridgeline_','ThirdPartyPro'], captainIdx:0 },
  { id:'t7', name:'Salt Mine', game:'rocket-league', charity:'gamers-outreach', status:'pending', players:['DoubleTap.','AerialAce','GroundGame_'], captainIdx:1 },
  { id:'t8', name:'Hollow Point', game:'valorant', charity:'stack-up', status:'confirmed', players:['Wraith_9','SmokeScreen','Anchor.','LurkMode','ClutchOrKick'], captainIdx:4 },
];

// Tournament bracket — single elimination, 8 teams -> QF, SF, F
const FABC_MATCHES = [
  { id:'m1', round:'Quarterfinal', teamA:'t1', teamB:'t7', scoreA:13, scoreB:6, status:'completed' },
  { id:'m2', round:'Quarterfinal', teamA:'t4', teamB:'t8', scoreA:11, scoreB:13, status:'completed' },
  { id:'m3', round:'Quarterfinal', teamA:'t2', teamB:'t6', scoreA:3, scoreB:1, status:'completed' },
  { id:'m4', round:'Quarterfinal', teamA:'t3', teamB:'t5', scoreA:2, scoreB:0, status:'live' },
  { id:'m5', round:'Semifinal', teamA:'t1', teamB:'t8', scoreA:null, scoreB:null, status:'upcoming', schedule:'Sat, Aug 2 · 6:00 PM ET' },
  { id:'m6', round:'Semifinal', teamA:'t2', teamB:null, scoreA:null, scoreB:null, status:'tbd' },
  { id:'m7', round:'Final', teamA:null, teamB:null, scoreA:null, scoreB:null, status:'tbd' },
];

const FABC_TOURNAMENT = {
  name: 'Summer Clash 2026',
  round: 'Quarterfinals',
  teamsRegistered: FABC_TEAMS.filter(t=>t.status==='confirmed').length,
  teamCap: 16,
  fundsRaised: 8420,
  fundsGoal: 15000,
  startDate: 'August 2, 2026',
  featuredCharity: 'gamers-outreach',
};

/* Loads all four collections from the shared backend (falling back to the
   defaults above if the API isn't reachable yet), and returns the same
   FABC_DATA-shaped object every page already uses — so pages just need to
   `const FABC_DATA = await fabcLoadData();` once at the top of their script
   instead of reading a static object. */
async function fabcLoadData() {
  const [games, charities, teams, matches] = await Promise.all([
    fabcApiGet('games', FABC_GAMES),
    fabcApiGet('charities', FABC_CHARITIES),
    fabcApiGet('teams', FABC_TEAMS),
    fabcApiGet('matches', FABC_MATCHES),
  ]);
  return {
    games, charities, teams, matches,
    tournament: FABC_TOURNAMENT,
    getTeam(id){ return this.teams.find(t=>t.id===id) || null; },
    getCharity(id){ return this.charities.find(c=>c.id===id) || null; },
    getGame(id){ return this.games.find(g=>g.id===id) || null; },
  };
}
