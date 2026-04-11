// ─── STROOP STATE ─────────────────────────────────────────
let stroopTimes    = [];   // ms per answer (with penalty for errors)
let stroopErrors   = 0;
let stroopRound    = 0;
let stroopStart    = null;
let stroopCorrect  = null; // hex of the correct ink color this round
let stroopAnswered = false;

// ─── ENTRY POINT ──────────────────────────────────────────
function startStroopTest() {
  stroopTimes    = [];
  stroopErrors   = 0;
  stroopRound    = 0;
  showScreen('screen-stroop');
  buildProgress('stroop-progress', 0, STROOP_ROUNDS);
  document.getElementById('stroop-flash').textContent = '';
  document.getElementById('stroop-accuracy').textContent = '';
  stroopNextRound();
}

// ─── ROUND LIFECYCLE ──────────────────────────────────────
function stroopNextRound() {
  stroopAnswered = false;

  buildProgress('stroop-progress', stroopRound, STROOP_ROUNDS);
  document.getElementById('stroop-round-label').textContent = `Round ${stroopRound + 1} of ${STROOP_ROUNDS}`;
  document.getElementById('stroop-flash').textContent       = '';
  document.getElementById('stroop-flash').className         = 'stroop-flash';

  // Pick a random ink color for the word
  const inkIdx  = Math.floor(Math.random() * STROOP_COLORS.length);
  const inkColor = STROOP_COLORS[inkIdx];

  // Pick a different color for the word label (the "wrong" text)
  let wordIdx;
  do { wordIdx = Math.floor(Math.random() * STROOP_COLORS.length); }
  while (wordIdx === inkIdx);
  const wordColor = STROOP_COLORS[wordIdx];

  stroopCorrect = inkColor.hex;

  // Display the word in ink color
  document.getElementById('stroop-word').textContent  = wordColor.name;
  document.getElementById('stroop-word').style.color  = inkColor.hex;
  document.getElementById('stroop-prompt').textContent = 'Tap the INK color — not the word!';

  // Build 4 answer choices: correct ink + 3 random distractors
  const choiceIndices = [inkIdx];
  while (choiceIndices.length < 4) {
    const r = Math.floor(Math.random() * STROOP_COLORS.length);
    if (!choiceIndices.includes(r)) choiceIndices.push(r);
  }
  // Shuffle choices
  choiceIndices.sort(() => Math.random() - 0.5);

  const grid = document.getElementById('stroop-choices');
  grid.innerHTML = '';
  choiceIndices.forEach(idx => {
    const col = STROOP_COLORS[idx];
    const btn = document.createElement('button');
    btn.className = 'stroop-btn';
    btn.style.background = col.hex + '22'; // faint tint
    btn.style.color      = col.hex;
    btn.innerHTML = `<div class="swatch" style="background:${col.hex}"></div>${col.name}`;
    btn.onclick = () => stroopHandleTap(btn, col.hex === inkColor.hex);
    grid.appendChild(btn);
  });

  stroopStart = performance.now();
}

// ─── TAP HANDLER ──────────────────────────────────────────
function stroopHandleTap(btn, isCorrect) {
  if (stroopAnswered) return;
  stroopAnswered = true;

  const elapsed = Math.round(performance.now() - stroopStart);
  const flash   = document.getElementById('stroop-flash');

  // Visually reveal which was correct
  document.querySelectorAll('.stroop-btn').forEach(b => {
    if (b.style.color === stroopCorrect || rgbToHex(b.style.color) === stroopCorrect) {
      b.classList.add('correct');
    }
  });

  if (isCorrect) {
    btn.classList.add('correct');
    stroopTimes.push(elapsed);
    flash.textContent = elapsed < 1000 ? `✓ ${(elapsed/1000).toFixed(2)}s — Fast!`
                      : elapsed < 1800 ? `✓ ${(elapsed/1000).toFixed(2)}s — Good`
                      :                  `✓ ${(elapsed/1000).toFixed(2)}s — Slow...`;
    flash.className = 'stroop-flash good';
  } else {
    btn.classList.add('wrong');
    stroopErrors++;
    // Add 1200ms penalty for wrong answer
    stroopTimes.push(elapsed + 1200);
    flash.textContent = `✗ Wrong color — +1.2s penalty`;
    flash.className   = 'stroop-flash bad';
  }

  // Update running accuracy
  const acc = document.getElementById('stroop-accuracy');
  const correct = stroopRound + 1 - stroopErrors;
  acc.textContent = `${correct}/${stroopRound + 1} correct so far`;

  stroopRound++;

  if (stroopRound < STROOP_ROUNDS) {
    setTimeout(stroopNextRound, 1300);
  } else {
    const avg = Math.round(stroopTimes.reduce((a, b) => a + b, 0) / stroopTimes.length);
    setTimeout(() => onTestComplete('stroop', { avg, times: stroopTimes, errors: stroopErrors }), 1300);
  }
}

// ─── UTIL: rgb() string → hex ─────────────────────────────
// Needed to compare button style.color (browser returns rgb()) to hex values
function rgbToHex(rgb) {
  const m = rgb.match(/\d+/g);
  if (!m || m.length < 3) return '';
  return '#' + m.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
}
