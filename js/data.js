// ─── ROUND COUNTS (per test) ──────────────────────────────
const RT_ROUNDS     = 3;   // reaction time — short & punchy
const FT_ROUNDS     = 5;   // find tom — difficulty scales with rounds
const STROOP_ROUNDS = 5;   // stroop — 5 fast questions

// ─── OTHER CONSTANTS ──────────────────────────────────────
const SOBER_RT  = 280;   // adjusted for touchscreen latency (~+50 ms vs keyboard)
const TOM_LIMIT = 5000;  // ms before Find Tom round times out

// ─── REACTION TIME LEVELS ─────────────────────────────────
const rtLevels = [
  {
    maxMs: 300, cls: 'level-0', badge: 'Sharp as a Tack',
    verdict: 'Basically sober.',
    sub: "Tap speed is textbook-baseline. Either you just arrived, or you're built different.",
    tip: "💧 Keep hydrating. You're the one who'll remember tonight.",
    sci: 'Avg. phone tap RT sober: ~250–310 ms (touchscreen adds ~50 ms vs keyboard)'
  },
  {
    maxMs: 380, cls: 'level-1', badge: 'Pleasantly Buzzed',
    verdict: 'One or two drinks in.',
    sub: 'Slightly above baseline but functional. Classic sweet-spot buzz.',
    tip: "🍺 One more won't hurt. After that, grab some water.",
    sci: 'BAC ~0.03–0.05% slows RT ~10–15% (Mets et al., 2011)'
  },
  {
    maxMs: 480, cls: 'level-2', badge: 'Getting Saucy',
    verdict: 'Noticeably impaired.',
    sub: "Reaction time is ~30–50% above sober. You're fun, but don't drive.",
    tip: "🥤 Drink water. Eat something. You're at the regrettable-decisions threshold.",
    sci: 'BAC ~0.06–0.09% slows RT ~20–40% (Fillmore et al., 2002)'
  },
  {
    maxMs: 650, cls: 'level-3', badge: 'Properly Drunk',
    verdict: 'Whoa. Clearly impaired.',
    sub: '50–100% above normal. Your brain is running on vibes.',
    tip: '🚰 Full glass of water NOW. Sit down. No more drinks.',
    sci: 'BAC ~0.10–0.14% can slow RT 40–60% (Ogden & Moskowitz, 2004)'
  },
  {
    maxMs: Infinity, cls: 'level-4', badge: 'How Are You Standing?',
    verdict: 'Legendary impairment.',
    sub: "At this level you're a science experiment. An impressive one.",
    tip: '🛑 Water. Food. Sit. No stairs without supervision.',
    sci: 'BAC 0.15%+ severely degrades psychomotor function (NHTSA, 2000)'
  }
];

// ─── FIND TOM LEVELS ──────────────────────────────────────
const ftLevels = [
  {
    maxMs: 1800, cls: 'level-0', badge: 'Eagle Eyes',
    verdict: 'Found Tom instantly.',
    sub: "Alcohol hasn't touched your visual attention. Impressive.",
    sci: 'Sober visual search in a crowd: ~1–2 s (Treisman & Gelade, 1980)'
  },
  {
    maxMs: 2800, cls: 'level-1', badge: 'Slightly Squinty',
    verdict: 'Found Tom — took a moment.',
    sub: 'A small delay. Probably just the buzz. Still doing well.',
    sci: 'BAC 0.04% slightly increases visual scan time (Nicholson et al., 2007)'
  },
  {
    maxMs: 4000, cls: 'level-2', badge: "Where's Tom Again?",
    verdict: 'That took some effort.',
    sub: 'Attention and visual search are measurably impaired. Classic alcohol.',
    sci: 'BAC 0.06–0.08% significantly impairs selective attention (Schweizer & Vogel-Sprott, 2008)'
  },
  {
    maxMs: 5500, cls: 'level-3', badge: "Tom? Who's Tom?",
    verdict: 'Struggling to focus.',
    sub: 'Selective attention is quite impaired. Things are blurry up there.',
    sci: 'BAC 0.10% impairs focused attention by 30–50% (Schweizer et al., 2006)'
  },
  {
    maxMs: Infinity, cls: 'level-4', badge: 'Tom Left the Party',
    verdict: 'Tom was right there.',
    sub: 'A miss or very long search. Attention is severely impaired.',
    sci: 'BAC 0.15%+ severely disrupts visual attention and target detection'
  }
];

// ─── STROOP LEVELS ────────────────────────────────────────
// Score = avg ms per correct answer (wrong answers add a 1200ms penalty)
const stroopLevels = [
  {
    maxMs: 1200, cls: 'level-0', badge: 'No Interference',
    verdict: 'Brain working perfectly.',
    sub: "Your inhibitory control is totally intact. Sober brain energy.",
    sci: 'Sober Stroop color-word RT: ~800–1200 ms (MacLeod, 1991 — the defining Stroop review)'
  },
  {
    maxMs: 1700, cls: 'level-1', badge: 'Slight Confusion',
    verdict: 'A little Stroop interference.',
    sub: 'Small slowdown — the brain is starting to let the wrong signals through.',
    sci: 'BAC ~0.04% begins to impair inhibitory control (Marczinski & Fillmore, 2003)'
  },
  {
    maxMs: 2400, cls: 'level-2', badge: 'Brain Buffering...',
    verdict: 'Inhibition clearly impaired.',
    sub: 'Alcohol is disrupting the prefrontal cortex — the part that ignores distractions.',
    sci: 'BAC ~0.06–0.08% significantly impairs Stroop performance (Josephs & Steele, 1990)'
  },
  {
    maxMs: 3200, cls: 'level-3', badge: 'Reading? What Reading?',
    verdict: 'Major cognitive interference.',
    sub: "Your brain can't filter out the word meaning. Classic heavy impairment.",
    sci: 'BAC ~0.10% causes major deficits in response inhibition (Lyvers & Maltzman, 1991)'
  },
  {
    maxMs: Infinity, cls: 'level-4', badge: 'Full Brain Shutdown',
    verdict: 'Color? Word? Same thing apparently.',
    sub: "At this point your prefrontal cortex has left the building.",
    sci: 'BAC 0.15%+ severely degrades all executive function (Schweizer et al., 2006)'
  }
];

// ─── FINAL COMBINED LEVELS ────────────────────────────────
const finalLevels = [
  {
    cls: 'level-0', 
    badge: 'Scientifically Sober 🧠',
    verdict: 'Your neurons are firing correctly.',
    sub: "You're the one explaining things to others right now. Slightly disappointing for a night out.",
    tip: "You can drink more. You probably will."
  },
  {
    cls: 'level-1', 
    badge: 'Buzzed Philosopher 🍷',
    verdict: 'You feel smarter than usual. You are not.',
    sub: 'Deep conversations incoming. None will be remembered tomorrow.',
    tip: "Pace yourself. You’re entering dangerous confidence territory."
  },
  {
    cls: 'level-2', 
    badge: 'Confidently Wrong 😎',
    verdict: 'Reaction time: questionable. Confidence: extremely high.',
    sub: 'You would lose an argument with a chair right now.',
    tip: "Maybe drink water. Or don’t — you won’t listen anyway."
  },
  {
    cls: 'level-3', 
    badge: 'Walking Experiment 🧪',
    verdict: 'Motor skills are optional at this point.',
    sub: "If this were a lab, you'd be the control group for bad decisions.",
    tip: "Water. Sit down. Re-evaluate life choices."
  },
  {
    cls: 'level-4', 
    badge: 'Legally a Liability 🚨',
    verdict: 'You are operating on vibes, not biology.',
    sub: 'Memory tomorrow: unavailable. Coordination: theoretical.',
    tip: "Stop drinking. Find water. Find friends. Find yourself."
  }
];

const ROASTS = [
  "You just blinked manually, didn’t you?",
  "You thought this test was easy. That’s concerning.",
  "Your future self is already disappointed.",
  "The prefrontal cortex has left the chat.",
  "Your coordination is currently a suggestion, not a fact.",
  "A gold fish has better focus than you right now.",
  "You are the reason warnings are printed on bottles.",
  "Calibration error: User is 40% liquid courage."
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

// ─── STROOP COLOR DATA ────────────────────────────────────
// Each entry: the color name shown as text, and the actual ink color
// The correct answer is always the INK color (not the word)
const STROOP_COLORS = [
  { name: 'RED',    hex: '#ff5c5c' },
  { name: 'BLUE',   hex: '#5ca8ff' },
  { name: 'GREEN',  hex: '#5cf59a' },
  { name: 'YELLOW', hex: '#f5e35c' },
  { name: 'PINK',   hex: '#f55cf0' },
  { name: 'ORANGE', hex: '#f5a55c' },
];

// ─── MEMORY TEST LEVELS ───────────────────────────────────
// Score = highest level reached (sequence length)
const memoryLevels = [
  {
    minLevel: 7, cls: 'level-0', badge: 'Perfect Recall',
    verdict: 'Memory is sharp.',
    sub: 'Your short-term memory is firing on all cylinders. No alcohol interference here.',
    tip: '💧 Keep it steady. Your brain is still in the game.',
    sci: 'Working memory capacity (Miller\'s Law) is typically 7 ± 2 items.'
  },
  {
    minLevel: 5, cls: 'level-1', badge: 'Slightly Foggy',
    verdict: 'Good, but not perfect.',
    sub: 'You missed a beat. Short-term retention is starting to dip slightly.',
    tip: '🍺 Enjoy the buzz, but maybe skip the next round of shots.',
    sci: 'BAC 0.05% begins to disrupt the encoding of new short-term memories.'
  },
  {
    minLevel: 4, cls: 'level-2', badge: 'Memory Leak',
    verdict: 'Noticeable forgetfulness.',
    sub: 'Your brain is struggling to hold onto the sequence. Impairment is visible.',
    tip: '🥤 Time for a non-alcoholic drink. Your brain needs a break.',
    sci: 'Alcohol significantly reduces working memory capacity as BAC reaches 0.08%.'
  },
  {
    minLevel: 3, cls: 'level-3', badge: 'Short-Circuit',
    verdict: 'Where was I?',
    sub: 'Encoding sequences is becoming very difficult. Vibing > Thinking.',
    tip: '🚰 Drink water now. You won\'t remember much of this tomorrow.',
    sci: 'Significant memory impairment occurs at BAC 0.10% due to hippocampal suppression.'
  },
  {
    minLevel: 0, cls: 'level-4', badge: 'Total Blackout',
    verdict: 'Memory is offline.',
    sub: 'The sequence never stood a chance. You are heavily impaired.',
    tip: '🛑 Stop drinking. Sit down and stay safe.',
    sci: 'High BAC levels (0.15%+) can cause "fragmentary blackouts" or total memory loss.'
  }
];

// ─── HELPER ───────────────────────────────────────────────
function getLevel(ms, table) {
  // Check if it's the memory table (uses minLevel instead of maxMs)
  if (table === memoryLevels) {
    return table.find(l => ms >= l.minLevel);
  }
  return table.find(l => ms <= l.maxMs);
}
