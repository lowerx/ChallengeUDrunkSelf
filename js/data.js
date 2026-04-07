// ─── GAME CONSTANTS ───────────────────────────────────────
const ROUNDS    = 5;
const SOBER_RT  = 280;   // adjusted for touchscreen latency (~+50 ms vs keyboard)
const TOM_LIMIT = 5000;  // ms before Find Tom round times out

// ─── REACTION TIME LEVELS ─────────────────────────────────
// Thresholds account for ~50 ms extra touchscreen hardware latency.
// Sources: Mets et al. 2011, Fillmore et al. 2002, Ogden & Moskowitz 2004, NHTSA 2000
const rtLevels = [
  {
    maxMs: 300,
    cls: 'level-0',
    badge: 'Sharp as a Tack',
    verdict: 'Basically sober.',
    sub: "Your tap speed is textbook-baseline. Either you just arrived, or you're built different.",
    tip: "💧 Keep hydrating. You're the one who'll remember tonight.",
    sci: 'Avg. phone tap RT sober: ~250–310 ms (touchscreen adds ~50 ms vs keyboard)'
  },
  {
    maxMs: 380,
    cls: 'level-1',
    badge: 'Pleasantly Buzzed',
    verdict: 'One or two drinks in.',
    sub: 'Slightly above baseline but functional. Classic sweet-spot buzz.',
    tip: "🍺 One more won't hurt. After that, grab some water.",
    sci: 'BAC ~0.03–0.05% slows RT ~10–15% (Mets et al., 2011)'
  },
  {
    maxMs: 480,
    cls: 'level-2',
    badge: 'Getting Saucy',
    verdict: 'Noticeably impaired.',
    sub: "Reaction time is ~30–50% above sober. You're fun, but don't drive.",
    tip: "🥤 Drink water. Eat something. You're at the regrettable-decisions threshold.",
    sci: 'BAC ~0.06–0.09% slows RT ~20–40% (Fillmore et al., 2002)'
  },
  {
    maxMs: 650,
    cls: 'level-3',
    badge: 'Properly Drunk',
    verdict: 'Whoa. Clearly impaired.',
    sub: '50–100% above normal. Your brain is running on vibes.',
    tip: '🚰 Full glass of water NOW. Sit down. No more drinks.',
    sci: 'BAC ~0.10–0.14% can slow RT 40–60% (Ogden & Moskowitz, 2004)'
  },
  {
    maxMs: Infinity,
    cls: 'level-4',
    badge: 'How Are You Standing?',
    verdict: 'Legendary impairment.',
    sub: "At this level you're a science experiment. An impressive one.",
    tip: '🛑 Water. Food. Sit. No stairs without supervision.',
    sci: 'BAC 0.15%+ severely degrades psychomotor function (NHTSA, 2000)'
  }
];

// ─── FIND TOM LEVELS ──────────────────────────────────────
// Score = avg ms to find Tom (6000 ms penalty for misses/timeouts).
// Sources: Treisman & Gelade 1980, Nicholson et al. 2007, Schweizer & Vogel-Sprott 2008
const ftLevels = [
  {
    maxMs: 1800,
    cls: 'level-0',
    badge: 'Eagle Eyes',
    verdict: 'Found Tom instantly.',
    sub: "Alcohol hasn't touched your visual attention. Impressive.",
    sci: 'Sober visual search in a crowd: ~1–2 s (Treisman & Gelade, 1980)'
  },
  {
    maxMs: 2800,
    cls: 'level-1',
    badge: 'Slightly Squinty',
    verdict: 'Found Tom — took a moment.',
    sub: 'A small delay. Probably just the buzz. Still doing well.',
    sci: 'BAC 0.04% slightly increases visual scan time (Nicholson et al., 2007)'
  },
  {
    maxMs: 4000,
    cls: 'level-2',
    badge: "Where's Tom Again?",
    verdict: 'That took some effort.',
    sub: 'Attention and visual search are measurably impaired. Classic alcohol.',
    sci: 'BAC 0.06–0.08% significantly impairs selective attention (Schweizer & Vogel-Sprott, 2008)'
  },
  {
    maxMs: 5500,
    cls: 'level-3',
    badge: "Tom? Who's Tom?",
    verdict: 'Struggling to focus.',
    sub: 'Selective attention is quite impaired. Things are blurry up there.',
    sci: 'BAC 0.10% impairs focused attention by 30–50% (Schweizer et al., 2006)'
  },
  {
    maxMs: Infinity,
    cls: 'level-4',
    badge: 'Tom Left the Party',
    verdict: 'Tom was right there.',
    sub: 'A miss or very long search. Attention is severely impaired.',
    sci: 'BAC 0.15%+ severely disrupts visual attention and target detection'
  }
];

// ─── FINAL COMBINED LEVELS ────────────────────────────────
const finalLevels = [
  {
    cls: 'level-0',
    badge: 'Sober as a Judge',
    verdict: "Are you sure you're at a party?",
    sub: "Scores are textbook-sober. Either you just arrived, or you're secretly drinking water.",
    tip: "💧 Keep it up. You're the memory of this night."
  },
  {
    cls: 'level-1',
    badge: 'Pleasantly Buzzed',
    verdict: 'One or two drinks in — nice.',
    sub: 'Slightly off baseline but very functional. Classic social buzz.',
    tip: "🍺 One more won't hurt. After that slow down."
  },
  {
    cls: 'level-2',
    badge: 'Getting Saucy',
    verdict: 'Noticeably impaired on both tests.',
    sub: "Reaction and attention are both showing the effects. Don't drive.",
    tip: "🥤 Water and food. Now. You're at the regrettable-decisions threshold."
  },
  {
    cls: 'level-3',
    badge: 'Properly Drunk',
    verdict: 'Whoa there.',
    sub: "Your brain is running on vibes. Impressive you finished both tests.",
    tip: '🚰 Full glass of water NOW. Sit somewhere safe.'
  },
  {
    cls: 'level-4',
    badge: 'How Are You Standing?',
    verdict: 'Legendary impairment.',
    sub: "You're a cautionary tale. A charming one.",
    tip: '🛑 Water. Food. Sit. Handrail for any stairs.'
  }
];

// ─── FIND TOM ASSETS ──────────────────────────────────────
const ALL_NAMES = [
  'Sam','Alex','Max','Lee','Jay','Kim','Pat','Chris','Blake','Ryan',
  'Dana','Jesse','Morgan','Casey','Avery','Jordan','Quinn','Reese',
  'Drew','Sky','Cam','Robin','Peyton','Sage'
];

const SKIN_COLS = [
  '#e8a87c','#c68642','#f1c27d','#8d5524','#e0b090',
  '#a0522d','#ffcba4','#7b4f2a','#d4956a','#b07850',
  '#fad6b2','#6b3a2a'
];

const HAIR_COLS = [
  '#2c1810','#4a3520','#8B4513','#d2691e','#1a1a2e',
  '#2d3a5c','#3c2a1a','#1a1a1a','#6b4226','#c8a96a'
];

// ─── HELPER ───────────────────────────────────────────────
function getLevel(ms, table) {
  return table.find(l => ms <= l.maxMs);
}
