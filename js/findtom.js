// ─── FIND TOM STATE ───────────────────────────────────────
let ftTimes        = [];
let ftRound        = 0;
let ftTomIdx       = -1;
let ftTimerInterval = null;
let ftRoundStart   = null;
let ftAnswered     = false;

// ─── FACE SVG GENERATOR ───────────────────────────────────
// Builds a deterministic but varied SVG face from a numeric seed.
function makeFaceSVG(seed) {
  const skin      = SKIN_COLS[seed % SKIN_COLS.length];
  const hair      = HAIR_COLS[(seed * 3 + 7) % HAIR_COLS.length];
  const hairStyle = ['short', 'long', 'bald', 'mohawk', 'curly'][(seed * 7 + 1) % 5];
  const eyeNarrow = (seed % 3 === 0);
  const mouthType = seed % 3;
  const eyeCy     = eyeNarrow ? 29 : 31;
  const eyeRy     = eyeNarrow ? 2.5 : 4.5;

  // Hair shapes
  let hairSVG = '';
  if (hairStyle === 'short') {
    hairSVG = `<ellipse cx="26" cy="14" rx="15" ry="10" fill="${hair}"/>`;
  } else if (hairStyle === 'long') {
    hairSVG = `<ellipse cx="26" cy="14" rx="15" ry="10" fill="${hair}"/>
               <rect x="11" y="20" width="4" height="20" rx="2" fill="${hair}"/>
               <rect x="37" y="20" width="4" height="20" rx="2" fill="${hair}"/>`;
  } else if (hairStyle === 'curly') {
    hairSVG = `<ellipse cx="26" cy="13" rx="15" ry="10" fill="${hair}"/>
               <circle cx="13" cy="18" r="5" fill="${hair}"/>
               <circle cx="39" cy="18" r="5" fill="${hair}"/>`;
  } else if (hairStyle === 'mohawk') {
    hairSVG = `<rect x="22" y="4" width="8" height="15" rx="4" fill="${hair}"/>`;
  }
  // 'bald' → no hair SVG

  // Mouth shapes
  let mouthSVG = '';
  if (mouthType === 0) {
    mouthSVG = `<path d="M19 43 Q26 48 33 43" stroke="#7a3b1e" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  } else if (mouthType === 1) {
    mouthSVG = `<line x1="20" y1="44" x2="32" y2="44" stroke="#7a3b1e" stroke-width="1.5" stroke-linecap="round"/>`;
  } else {
    mouthSVG = `<path d="M19 46 Q26 42 33 46" stroke="#7a3b1e" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  }

  return `<svg viewBox="0 0 52 56" xmlns="http://www.w3.org/2000/svg" width="50" height="50">
    ${hairSVG}
    <ellipse cx="26" cy="31" rx="15" ry="18" fill="${skin}"/>
    <ellipse cx="19" cy="${eyeCy}" rx="4.5" ry="${eyeRy}" fill="#222"/>
    <ellipse cx="33" cy="${eyeCy}" rx="4.5" ry="${eyeRy}" fill="#222"/>
    <ellipse cx="20" cy="${eyeCy - 1}" rx="1.5" ry="1" fill="white" opacity="0.5"/>
    <ellipse cx="34" cy="${eyeCy - 1}" rx="1.5" ry="1" fill="white" opacity="0.5"/>
    ${mouthSVG}
  </svg>`;
}

// ─── ENTRY POINT ──────────────────────────────────────────
function startFindTomTest() {
  ftTimes = [];
  ftRound = 0;
  showScreen('screen-findtom');
  buildProgress('ft-progress', 0);
  document.getElementById('ft-round-result').textContent = '';
  ftNextRound();
}

// ─── ROUND LIFECYCLE ──────────────────────────────────────
function ftNextRound() {
  ftAnswered = false;
  clearInterval(ftTimerInterval);

  buildProgress('ft-progress', ftRound);
  document.getElementById('ft-round-label').textContent  = `Round ${ftRound + 1} of ${ROUNDS}`;
  document.getElementById('ft-round-result').textContent = '';
  document.getElementById('ft-round-result').className   = 'round-result';

  const bar = document.getElementById('ft-timer-bar');
  bar.style.width = '100%';
  bar.className   = 'tom-timer-bar';

  // Difficulty scales with each round: more faces as rounds progress
  const counts   = [6, 9, 9, 12, 12];
  const cols     = [3, 3, 3, 4,  4];
  const count    = counts[ftRound];
  const colCount = cols[ftRound];

  // Generate unique face seeds
  const used  = new Set();
  const seeds = [];
  while (seeds.length < count) {
    const s = Math.floor(Math.random() * 800) + ftRound * 50 + seeds.length * 17;
    if (!used.has(s % 200)) { used.add(s % 200); seeds.push(s); }
  }

  ftTomIdx = Math.floor(Math.random() * count);

  const grid = document.getElementById('faces-grid');
  grid.style.gridTemplateColumns = `repeat(${colCount}, 1fr)`;
  grid.innerHTML = '';

  const namePool = ALL_NAMES.filter(n => n !== 'Tom');

  seeds.forEach((seed, i) => {
    const isTom = (i === ftTomIdx);
    const name  = isTom ? 'Tom' : namePool[seed % namePool.length];

    const cell = document.createElement('div');
    cell.className      = 'face-cell';
    cell.dataset.isTom  = isTom ? '1' : '0';
    cell.innerHTML      = makeFaceSVG(seed + i * 13) + `<div class="face-name">${name}</div>`;
    cell.onclick        = () => ftHandleTap(cell, isTom);
    grid.appendChild(cell);
  });

  // Start countdown timer
  ftRoundStart = performance.now();
  const t0 = Date.now();
  ftTimerInterval = setInterval(() => {
    const elapsed = Date.now() - t0;
    const pct     = Math.max(0, 100 - (elapsed / TOM_LIMIT) * 100);
    bar.style.width = pct + '%';
    bar.className   = 'tom-timer-bar' + (pct < 30 ? ' danger' : pct < 60 ? ' warning' : '');
    if (elapsed >= TOM_LIMIT && !ftAnswered) ftHandleTap(null, false, true);
  }, 80);
}

// ─── TAP HANDLER ──────────────────────────────────────────
function ftHandleTap(cell, isTom, timeout = false) {
  if (ftAnswered) return;
  ftAnswered = true;
  clearInterval(ftTimerInterval);

  const elapsed = timeout ? 6000 : Math.round(performance.now() - ftRoundStart);
  ftTimes.push(elapsed);

  // Always reveal where Tom was
  document.querySelectorAll('.face-cell').forEach(c => {
    if (c.dataset.isTom === '1') c.classList.add('reveal');
  });

  const res = document.getElementById('ft-round-result');

  if (timeout) {
    res.textContent = "⏱ Time's up! Tom was there...";
    res.className   = 'round-result bad';
    document.getElementById('ft-timer-bar').style.width = '0%';
  } else if (isTom) {
    cell.classList.add('correct');
    res.textContent = elapsed < 1800
      ? `✓ ${(elapsed / 1000).toFixed(2)}s — Instant!`
      : `✓ ${(elapsed / 1000).toFixed(2)}s — Got him!`;
    res.className = 'round-result good';
  } else {
    if (cell) cell.classList.add('wrong');
    res.textContent = "✗ Wrong — that's the alcohol talking";
    res.className   = 'round-result bad';
  }

  ftRound++;
  if (ftRound < ROUNDS) {
    setTimeout(ftNextRound, 1500);
  } else {
    const avg = Math.round(ftTimes.reduce((a, b) => a + b, 0) / ftTimes.length);
    setTimeout(() => onTestComplete('findtom', { avg, times: ftTimes }), 1500);
  }
}
