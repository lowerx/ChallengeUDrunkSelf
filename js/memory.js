// ─── MEMORY TEST LOGIC ───────────────────────────────────
let memSequence = [];
let userSequence = [];
let memLevel = 1;
let isShowingSequence = false;

function startMemoryTest() {
  memSequence = [];
  userSequence = [];
  memLevel = 1;
  showScreen('screen-memory');
  
  // Bind tile clicks
  const tiles = document.querySelectorAll('.mem-tile');
  tiles.forEach(tile => {
    tile.onclick = function() {
      if (isShowingSequence) return;
      handleTileClick(parseInt(this.dataset.idx));
    };
  });

  setTimeout(nextMemoryLevel, 800);
}

function nextMemoryLevel() {
  userSequence = [];
  document.getElementById('mem-level-label').textContent = 'Level ' + memLevel;
  document.getElementById('mem-instr').textContent = 'Watch carefully...';
  
  // Add a new random tile to the sequence
  memSequence.push(Math.floor(Math.random() * 9));
  
  playSequence();
}

function playSequence() {
  isShowingSequence = true;
  document.getElementById('mem-grid').classList.add('locked');
  
  let i = 0;
  const interval = setInterval(() => {
    flashTile(memSequence[i]);
    i++;
    if (i >= memSequence.length) {
      clearInterval(interval);
      setTimeout(() => {
        isShowingSequence = false;
        document.getElementById('mem-grid').classList.remove('locked');
        document.getElementById('mem-instr').innerHTML = 'Repeat the sequence! <strong>' + memSequence.length + ' taps</strong>';
      }, 600);
    }
  }, 800);
}

function flashTile(idx) {
  const tile = document.querySelector(`.mem-tile[data-idx="${idx}"]`);
  tile.classList.add('active');
  // Optional: play sound here
  setTimeout(() => {
    tile.classList.remove('active');
  }, 400);
}

function handleTileClick(idx) {
  userSequence.push(idx);
  const currentStep = userSequence.length - 1;
  const tile = document.querySelector(`.mem-tile[data-idx="${idx}"]`);

  if (userSequence[currentStep] === memSequence[currentStep]) {
    // Correct tap
    tile.classList.add('correct');
    setTimeout(() => tile.classList.remove('correct'), 200);

    if (userSequence.length === memSequence.length) {
      // Level complete!
      memLevel++;
      document.getElementById('mem-instr').textContent = 'Perfect!';
      setTimeout(nextMemoryLevel, 1000);
    }
  } else {
    // Wrong tap - Game Over
    tile.classList.add('wrong');
    document.getElementById('mem-instr').textContent = 'Wrong tile!';
    document.getElementById('mem-grid').classList.add('locked');
    
    setTimeout(() => {
      tile.classList.remove('wrong');
      // Final result is the sequence length reached
      onTestComplete('memory', { 
        level: memLevel,
        avg: memLevel // We'll use level as the primary score
      });
    }, 1000);
  }
}
