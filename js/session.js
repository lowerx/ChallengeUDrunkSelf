// ─── SESSION STATE ────────────────────────────────────────
let selectedTests    = ['reaction', 'findtom'];
let testQueue        = [];
let currentTestIndex = 0;
let scores           = {};  // { reaction: {avg, times}, findtom: {avg, times} }

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

// ─── TEST SELECTION (intro screen) ───────────────────────
function toggleTest(key) {
  const idx = selectedTests.indexOf(key);
  const el  = document.getElementById('card-' + key);
  if (idx > -1) {
    if (selectedTests.length === 1) return; // keep at least one selected
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
    findtom:  '👀 Find Tom — Get Ready'
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
  if (key === 'reaction') startReactionTest();
  else if (key === 'findtom') startFindTomTest();
}

// Called by each test module when its rounds are complete
function onTestComplete(key, result) {
  scores[key] = result;
  currentTestIndex++;
  if (currentTestIndex < testQueue.length) {
    showMidResults(key, result);
  } else {
    showFinalResults();
  }
}

function startNextTest() {
  launchCountdown(testQueue[currentTestIndex]);
}

// ─── MID-TEST RESULTS (shown between tests) ───────────────
function showMidResults(key, result) {
  const table = key === 'reaction' ? rtLevels : ftLevels;
  const lv    = getLevel(result.avg, table);

  document.getElementById('mid-badge').textContent  = lv.badge;
  document.getElementById('mid-badge').className    = 'level-badge ' + lv.cls;
  document.getElementById('mid-score').textContent  = key === 'reaction'
    ? result.avg + ' ms avg'
    : (result.avg / 1000).toFixed(1) + 's avg';
  document.getElementById('mid-desc').textContent   = lv.verdict;

  const nextKey    = testQueue[currentTestIndex];
  const nextLabels = { reaction: '⚡ Next: Reaction Time →', findtom: '👀 Next: Find Tom →' };
  document.getElementById('mid-next-btn').textContent = nextLabels[nextKey] || 'Next Test →';

  showScreen('screen-mid');
}

// ─── FINAL RESULTS ────────────────────────────────────────
function showFinalResults() {
  let totalNorm = 0, count = 0;
  const statsHTML = [];

  if (scores.reaction) {
    const lv    = getLevel(scores.reaction.avg, rtLevels);
    const lvIdx = rtLevels.indexOf(lv);
    totalNorm  += lvIdx;
    count++;
    statsHTML.push(`<div class="stat-box">
      <div class="stat-val" style="color:var(--accent)">${scores.reaction.avg} ms</div>
      <div class="stat-label">Reaction avg</div>
    </div>`);
    statsHTML.push(`<div class="stat-box">
      <div class="stat-val">${Math.min(...scores.reaction.times)} ms</div>
      <div class="stat-label">Best round</div>
    </div>`);
  }

  if (scores.findtom) {
    const lv    = getLevel(scores.findtom.avg, ftLevels);
    const lvIdx = ftLevels.indexOf(lv);
    totalNorm  += lvIdx;
    count++;
    const hits = scores.findtom.times.filter(t => t < 6000).length;
    statsHTML.push(`<div class="stat-box">
      <div class="stat-val" style="color:var(--accent3)">${(scores.findtom.avg / 1000).toFixed(1)}s</div>
      <div class="stat-label">Find Tom avg</div>
    </div>`);
    statsHTML.push(`<div class="stat-box">
      <div class="stat-val">${hits}/${ROUNDS}</div>
      <div class="stat-label">Tom found</div>
    </div>`);
  }

  const avgLvlIdx = count > 0 ? Math.round(totalNorm / count) : 0;
  const lv        = finalLevels[Math.min(avgLvlIdx, finalLevels.length - 1)];
  const sciNote   = scores.reaction
    ? rtLevels[Math.min(avgLvlIdx, 4)].sci
    : ftLevels[Math.min(avgLvlIdx, 4)].sci;

  document.getElementById('final-badge').textContent   = lv.badge;
  document.getElementById('final-badge').className     = 'level-badge ' + lv.cls;
  document.getElementById('final-verdict').textContent = lv.verdict;
  document.getElementById('final-sub').textContent     = lv.sub;
  document.getElementById('final-stats-grid').innerHTML = statsHTML.join('');
  document.getElementById('final-tip').innerHTML       = '<strong>Tip:</strong> ' + lv.tip.slice(2).trim();
  document.getElementById('final-science').textContent = sciNote;

  showScreen('screen-results');
}

// ─── SHARE ────────────────────────────────────────────────
function shareResult() {
  const badge = document.getElementById('final-badge').textContent;
  const rt    = scores.reaction ? '⚡ ' + scores.reaction.avg + 'ms' : '';
  const ft    = scores.findtom  ? '👀 ' + (scores.findtom.avg / 1000).toFixed(1) + 's to find Tom' : '';
  const text  = '🎮 "' + badge + '"\n' + [rt, ft].filter(Boolean).join(' · ') + '\nChallenge Your Drunk Self';

  if (navigator.share) {
    navigator.share({ title: 'Challenge Your Drunk Self', text });
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
  }
}

// ─── SHARED UI HELPER ─────────────────────────────────────
function buildProgress(containerId, active) {
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  for (let i = 0; i < ROUNDS; i++) {
    const d = document.createElement('div');
    d.className = 'prog-dot' + (i < active ? ' done' : i === active ? ' active' : '');
    el.appendChild(d);
  }
}
