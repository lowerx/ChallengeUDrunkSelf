// ─── REACTION TIME STATE ──────────────────────────────────
let rtTimes  = [];
let rtRound  = 0;
let rtState  = 'idle';   // 'idle' | 'waiting' | 'ready' | 'penalty' | 'done'
let rtTimer  = null;
let rtStart  = null;

// ─── ENTRY POINT ──────────────────────────────────────────
function startReactionTest() {
  rtTimes = [];
  rtRound = 0;
  showScreen('screen-reaction');
  buildProgress('rt-progress', 0);
  document.getElementById('rt-round-result').textContent = '';
  rtScheduleRound();
}

// ─── ROUND LIFECYCLE ──────────────────────────────────────
function rtScheduleRound() {
  document.getElementById('rt-round-label').textContent = `Round ${rtRound + 1} of ${ROUNDS}`;
  buildProgress('rt-progress', rtRound);

  const zone = document.getElementById('rt-zone');
  zone.className = 'test-zone waiting';
  zone.innerHTML = `
    <div class="zone-label" style="color:var(--muted)">WAIT</div>
    <div class="zone-sub">Don't tap yet...</div>
  `;

  document.getElementById('rt-round-result').textContent = '';
  document.getElementById('rt-round-result').className   = 'round-result';

  rtState = 'waiting';

  // Random delay so the user can't predict the trigger
  const delay = 1500 + Math.random() * 3000;
  rtTimer = setTimeout(() => {
    zone.className = 'test-zone ready';
    zone.innerHTML = `
      <div class="zone-label" style="color:var(--accent)">TAP!</div>
      <div class="zone-sub">As fast as you can!</div>
    `;
    rtState = 'ready';
    rtStart = performance.now();
  }, delay);
}

// ─── TAP HANDLER ──────────────────────────────────────────
function rtHandleTap() {
  if (rtState === 'waiting') {
    // Tapped too early — penalise and replay the round
    clearTimeout(rtTimer);
    const zone = document.getElementById('rt-zone');
    zone.className = 'test-zone too-early';
    zone.innerHTML = `
      <div class="zone-label" style="color:var(--accent2)">TOO EARLY</div>
      <div class="zone-sub">Patience! Retrying...</div>
    `;
    rtState = 'penalty';

    const res = document.getElementById('rt-round-result');
    res.textContent = 'Tapped too early — round replayed';
    res.className   = 'round-result bad';

    setTimeout(rtScheduleRound, 1800);

  } else if (rtState === 'ready') {
    const ms = Math.round(performance.now() - rtStart);
    rtTimes.push(ms);
    rtState = 'done';

    const zone = document.getElementById('rt-zone');
    zone.className = 'test-zone done-round';
    zone.innerHTML = `
      <div class="zone-time">${ms} ms</div>
      <div class="zone-sub">${ms < 320 ? 'Quick!' : ms < 450 ? 'Not bad' : 'Bit slow...'}</div>
    `;

    const res = document.getElementById('rt-round-result');
    res.textContent = ms < 320 ? '✓ Fast!' : ms < 450 ? '✓ Decent' : '✓ Slow one';
    res.className   = 'round-result ' + (ms < 400 ? 'good' : 'bad');

    rtRound++;

    if (rtRound < ROUNDS) {
      // Brief pause then reset circle for next round
      setTimeout(() => {
        zone.innerHTML = `
          <div class="zone-label" style="color:var(--muted)">WAIT</div>
          <div class="zone-sub">Don't tap yet...</div>
        `;
        rtScheduleRound();
      }, 1100);
    } else {
      const avg = Math.round(rtTimes.reduce((a, b) => a + b, 0) / rtTimes.length);
      setTimeout(() => onTestComplete('reaction', { avg, times: rtTimes }), 1100);
    }
  }
}
