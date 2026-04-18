// ─── SESSION STATE ────────────────────────────────────────
let selectedTests    = ['reaction', 'findtom', 'stroop', 'memory'];
let testQueue        = [];
let currentTestIndex = 0;
let scores           = {};

// ─── NAVIGATION ───────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
}

function goHome() {
  location.reload(); 
}

// ─── SESSION FLOW ─────────────────────────────────────────
function startSession() {
  testQueue = selectedTests.filter(t => {
    const card = document.getElementById('card-' + t);
    return card && card.classList.contains('selected');
  });

  if (testQueue.length === 0) {
    alert('Please select at least one test.');
    return;
  }

  currentTestIndex = 0;
  scores = {};
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

  if (currentTestIndex < testQueue.length) {
    showMidResults(key, result);
  } else {
    showFinalResults();
  }
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
  const metricsHTML = [];

  // Helper to add metric
  const addMetric = (label, val, color) => {
    metricsHTML.push(`
      <div class="stat-box">
        <div class="stat-val" style="color:${color || 'var(--text)'}">${val}</div>
        <div class="stat-label">${label}</div>
      </div>
    `);
  };

  if (scores.reaction) {
    const lvIdx = rtLevels.indexOf(getLevel(scores.reaction.avg, rtLevels));
    totalNorm += lvIdx; count++;
    addMetric('Reaction', scores.reaction.avg + 'ms', 'var(--accent)');
  }
  if (scores.findtom) {
    const lvIdx = ftLevels.indexOf(getLevel(scores.findtom.avg, ftLevels));
    totalNorm += lvIdx; count++;
    addMetric('Attention', (scores.findtom.avg / 1000).toFixed(1) + 's', 'var(--accent3)');
  }
  if (scores.stroop) {
    const lvIdx = stroopLevels.indexOf(getLevel(scores.stroop.avg, stroopLevels));
    totalNorm += lvIdx; count++;
    addMetric('Filtering', (scores.stroop.avg / 1000).toFixed(2) + 's', '#f55cf0');
  }
  if (scores.memory) {
    const lvIdx = memoryLevels.indexOf(getLevel(scores.memory.level, memoryLevels));
    totalNorm += lvIdx; count++;
    addMetric('Memory', 'Lvl ' + scores.memory.level, 'var(--accent)');
  }

  const avgLvlIdx = count > 0 ? Math.round(totalNorm / count) : 0;
  const lv        = finalLevels[Math.min(avgLvlIdx, finalLevels.length - 1)];
  
  const finalScorePct = Math.min(100, Math.max(0, (avgLvlIdx * 20) + Math.floor(Math.random() * 15)));

  // 1. Main UI Update
  document.getElementById('final-badge').textContent    = lv.badge;
  document.getElementById('final-badge').className      = 'level-badge ' + lv.cls;
  document.getElementById('final-score-pct').textContent = finalScorePct;
  document.getElementById('final-verdict').textContent  = lv.badge; // Use badge as title
  document.getElementById('final-sub').textContent      = lv.verdict; // Use verdict as subtext
  document.getElementById('final-tip').textContent      = lv.tip;

  // 2. Fake Stats
  const fakeStats = [
    { l: 'Motor Response', v: '+' + (avgLvlIdx * 24 + 5) + '% delay', b: avgLvlIdx > 1 },
    { l: 'Coordination', v: avgLvlIdx > 2 ? 'Unstable' : avgLvlIdx > 0 ? 'Degraded' : 'Nominal', b: avgLvlIdx > 1 },
    { l: 'Decision Making', v: avgLvlIdx > 2 ? 'Compromised' : 'Functional', b: avgLvlIdx > 2 },
    { l: 'Confidence', v: avgLvlIdx > 1 ? 'Irrationally High' : 'Baseline', b: false }
  ];

  const statsHTML = fakeStats.map(s => `
    <div class="fake-stat">
      <div class="fs-label">${s.l}</div>
      <div class="fs-val ${s.b ? 'bad' : ''}">${s.v}</div>
    </div>
  `).join('');
  document.getElementById('fake-stats').innerHTML = statsHTML;

  // 3. Roast
  const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
  document.getElementById('roast-line').textContent = `"${roast}"`;

  // 4. Modal Data
  document.getElementById('exact-metrics-grid').innerHTML = metricsHTML.join('');

  // 5. Science Note
  const sciTable = scores.memory ? memoryLevels : scores.stroop ? stroopLevels : scores.reaction ? rtLevels : ftLevels;
  document.getElementById('final-science').textContent = sciTable[Math.min(avgLvlIdx, 4)].sci;

  // 6. Share Card Population
  document.getElementById('sc-badge').textContent = lv.badge;
  document.getElementById('sc-score-pct').textContent = finalScorePct;
  document.getElementById('sc-desc').textContent = lv.verdict;
  document.getElementById('sc-roast').textContent = `"${roast}"`;
  
  // Also add stats to Share Card
  const scStatsHTML = fakeStats.map(s => `
    <div class="sc-stat">
      <div class="scs-label">${s.l}</div>
      <div class="scs-val ${s.b ? 'bad' : ''}">${s.v}</div>
    </div>
  `).join('');
  document.getElementById('sc-stats-grid').innerHTML = scStatsHTML;

  // Save
  if (typeof window.saveGameSession === 'function') {
    window.saveGameSession(scores, avgLvlIdx, lv.badge);
  }

  showScreen('screen-results');
}

// ─── MODALS ───────────────────────────────────────────────
function openDetailsModal() { document.getElementById('details-overlay').classList.add('open'); }
function closeDetailsModal() { document.getElementById('details-overlay').classList.remove('open'); }

function openShareModal() { document.getElementById('share-overlay').classList.add('open'); }
function closeShareModal() { document.getElementById('share-overlay').classList.remove('open'); }

function copyShareText() {
  const badge = document.getElementById('final-badge').textContent;
  const score = document.getElementById('final-score-pct').textContent;
  const text = `🍻 CUDOS RESULT\nLevel: ${badge}\nScore: ${score}%\n\nTest your focus ↓\nhttps://cudos.netlify.app`;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard! Share it with your friends.');
    });
  }
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

function toggleTest(key) {
  const card = document.getElementById('card-' + key);
  card.classList.toggle('selected');
}
