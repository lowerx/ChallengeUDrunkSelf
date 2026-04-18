// ─── SESSION STATE ────────────────────────────────────────
let selectedTests    = ['reaction', 'findtom', 'stroop', 'memory'];
let testQueue        = [];
let currentTestIndex = 0;
let scores           = {};
// scores shape: {
//   reaction: { avg: ms, times: [] },
//   findtom:  { avg: ms, times: [] },
//   stroop:   { avg: ms, times: [], errors: n },
//   memory:   { level: n, avg: n }
// }

// ─── NAVIGATION ───────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

function goHome() {
  scores           = {};
  testQueue        = [];
  currentTestIndex = 0;
  showScreen('screen-intro');
}

// ─── TEST SELECTION ───────────────────────────────────────
function toggleTest(key) {
  const idx = selectedTests.indexOf(key);
  const el  = document.getElementById('card-' + key);
  if (idx > -1) {
    if (selectedTests.length === 1) return;
    selectedTests.splice(idx, 1);
    el.classList.remove('selected');
  } else {
    selectedTests.push(key);
    el.classList.add('selected');
  }
}

// ─── SESSION FLOW ─────────────────────────────────────────
function startSession() {
  scores           = {};
  testQueue        = [...selectedTests];
  currentTestIndex = 0;
  launchCountdown(testQueue[0]);
}

function launchCountdown(key) {
  const labels = {
    reaction: '⚡ Reaction Time — Get Ready',
    findtom:  '👀 Find Tom — Get Ready',
    stroop:   '🎨 Color Test — Get Ready',
    memory:   '🧠 Memory Test — Get Ready'
  };
  document.getElementById('countdown-label').textContent = labels[key] || 'Get ready...';
  document.getElementById('countdown-num').textContent   = '3';
  showScreen('screen-countdown');

  let c = 3;
  const iv = setInterval(() => {
    c--;
    if (c === 0) {
      clearInterval(iv);
      document.getElementById('countdown-num').textContent = 'GO!';
      setTimeout(() => launchTest(key), 600);
    } else {
      document.getElementById('countdown-num').textContent = c;
    }
  }, 1000);
}

function launchTest(key) {
  if      (key === 'reaction') startReactionTest();
  else if (key === 'findtom')  startFindTomTest();
  else if (key === 'stroop')   startStroopTest();
  else if (key === 'memory')   startMemoryTest();
}

// Called by each test module when complete
function onTestComplete(key, result) {
  scores[key] = result;
  currentTestIndex++;
  if (currentTestIndex < testQueue.length) showMidResults(key, result);
  else showFinalResults();
}

function startNextTest() {
  launchCountdown(testQueue[currentTestIndex]);
}

// ─── MID-TEST RESULTS ─────────────────────────────────────
function showMidResults(key, result) {
  const tableMap = { reaction: rtLevels, findtom: ftLevels, stroop: stroopLevels, memory: memoryLevels };
  const table    = tableMap[key];
  const lv       = getLevel(result.avg, table);

  const scoreStr = key === 'reaction' ? result.avg + ' ms avg'
                 : key === 'findtom'  ? (result.avg / 1000).toFixed(1) + 's avg'
                 : key === 'memory'   ? 'Level ' + result.level
                 :                      (result.avg / 1000).toFixed(2) + 's avg';

  document.getElementById('mid-badge').textContent  = lv.badge;
  document.getElementById('mid-badge').className    = 'level-badge ' + lv.cls;
  document.getElementById('mid-score').textContent  = scoreStr;
  document.getElementById('mid-desc').textContent   = lv.verdict;

  const nextKey    = testQueue[currentTestIndex];
  const nextLabels = {
    reaction: '⚡ Next: Reaction Time →',
    findtom:  '👀 Next: Find Tom →',
    stroop:   '🎨 Next: Color Test →',
    memory:   '🧠 Next: Memory Test →'
  };
  document.getElementById('mid-next-btn').textContent = nextLabels[nextKey] || 'Next Test →';

  showScreen('screen-mid');
}

// ─── FINAL RESULTS ────────────────────────────────────────
function showFinalResults() {
  let totalNorm = 0, count = 0;
  const statsHTML = [];

  if (scores.reaction) {
    const lvIdx = rtLevels.indexOf(getLevel(scores.reaction.avg, rtLevels));
    totalNorm += lvIdx; count++;
    statsHTML.push(`<div class="stat-box">
      <div class="stat-val" style="color:var(--accent)">${scores.reaction.avg} ms</div>
      <div class="stat-label">Reaction avg</div>
    </div>`);
    statsHTML.push(`<div class="stat-box">
      <div class="stat-val">${Math.min(...scores.reaction.times)} ms</div>
      <div class="stat-label">Best tap</div>
    </div>`);
  }

  if (scores.findtom) {
    const lvIdx = ftLevels.indexOf(getLevel(scores.findtom.avg, ftLevels));
    totalNorm += lvIdx; count++;
    const hits = scores.findtom.times.filter(t => t < 6000).length;
    statsHTML.push(`<div class="stat-box">
      <div class="stat-val" style="color:var(--accent3)">${(scores.findtom.avg / 1000).toFixed(1)}s</div>
      <div class="stat-label">Find Tom avg</div>
    </div>`);
    statsHTML.push(`<div class="stat-box">
      <div class="stat-val">${hits}/${FT_ROUNDS}</div>
      <div class="stat-label">Tom found</div>
    </div>`);
  }

  if (scores.stroop) {
    const lvIdx = stroopLevels.indexOf(getLevel(scores.stroop.avg, stroopLevels));
    totalNorm += lvIdx; count++;
    statsHTML.push(`<div class="stat-box">
      <div class="stat-val" style="color:#f55cf0">${(scores.stroop.avg / 1000).toFixed(2)}s</div>
      <div class="stat-label">Color test avg</div>
    </div>`);
    statsHTML.push(`<div class="stat-box">
      <div class="stat-val">${scores.stroop.errors} error${scores.stroop.errors !== 1 ? 's' : ''}</div>
      <div class="stat-label">Wrong taps</div>
    </div>`);
  }

  if (scores.memory) {
    const lvIdx = memoryLevels.indexOf(getLevel(scores.memory.level, memoryLevels));
    totalNorm += lvIdx; count++;
    statsHTML.push(`<div class="stat-box">
      <div class="stat-val" style="color:var(--accent)">Level ${scores.memory.level}</div>
      <div class="stat-label">Memory reached</div>
    </div>`);
    statsHTML.push(`<div class="stat-box">
      <div class="stat-val">${scores.memory.level >= 7 ? 'Miller-Safe' : 'Impaired'}</div>
      <div class="stat-label">Recall state</div>
    </div>`);
  }

  const avgLvlIdx = count > 0 ? Math.round(totalNorm / count) : 0;
  const lv        = finalLevels[Math.min(avgLvlIdx, finalLevels.length - 1)];

  // Science note from whichever test is most relevant
  const sciTable  = scores.memory ? memoryLevels : scores.stroop ? stroopLevels : scores.reaction ? rtLevels : ftLevels;
  const sciNote   = sciTable[Math.min(avgLvlIdx, 4)].sci;

  document.getElementById('final-badge').textContent    = lv.badge;
  document.getElementById('final-badge').className      = 'level-badge ' + lv.cls;
  document.getElementById('final-verdict').textContent  = lv.verdict;
  document.getElementById('final-sub').textContent      = lv.sub;
  document.getElementById('final-stats-grid').innerHTML = statsHTML.join('');
  document.getElementById('final-tip').innerHTML        = '<strong>Tip:</strong> ' + lv.tip.slice(2).trim();
  document.getElementById('final-science').textContent  = sciNote;

  // Save to Supabase if logged in
  if (typeof saveGameSession === 'function') {
    document.getElementById('save-notice').style.display = 'none';
    saveGameSession(scores, avgLvlIdx, lv.badge);
  }

  showScreen('screen-results');
}

// ─── SHARE ────────────────────────────────────────────────
function shareResult() {
  const badge = document.getElementById('final-badge').textContent;
  const parts = [];
  if (scores.reaction) parts.push('⚡ ' + scores.reaction.avg + 'ms reaction');
  if (scores.findtom)  parts.push('👀 ' + (scores.findtom.avg / 1000).toFixed(1) + 's to find Tom');
  if (scores.stroop)   parts.push('🎨 ' + (scores.stroop.avg / 1000).toFixed(2) + 's color test');
  const text = '🎮 "' + badge + '"\n' + parts.join(' · ') + '\nChallenge Your Drunk Self';

  if (navigator.share)           navigator.share({ title: 'Challenge Your Drunk Self', text });
  else if (navigator.clipboard)  navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
}

// ─── SHARED UI HELPER ─────────────────────────────────────
function buildProgress(containerId, done, total) {
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const d = document.createElement('div');
    d.className = 'prog-dot' + (i < done ? ' done' : i === done ? ' active' : '');
    el.appendChild(d);
  }
}
