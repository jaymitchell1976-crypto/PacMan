// =============================================================================
// CONFIG PANEL – live label sync for range sliders
// =============================================================================

/**
 * syncSpeedSliders – keeps ghostSpeed and pacSpeed sliders locked together.
 * @param {string} value – the new numeric string value from whichever slider moved.
 * A guard flag (`_syncingSpeed`) prevents the programmatic `.value` assignment
 * from re-firing this function and causing an infinite loop.
 */
let _syncingSpeed = false;
function syncSpeedSliders(value) {
  if (_syncingSpeed) return;
  _syncingSpeed = true;
  const label = parseFloat(value).toFixed(1) + '×';
  document.getElementById('ghostSpeed').value    = value;
  document.getElementById('pacSpeed').value      = value;
  document.getElementById('ghostSpeedVal').textContent = label;
  document.getElementById('pacSpeedVal').textContent   = label;
  _syncingSpeed = false;
}

/** Sync both sliders when ghost speed changes */
document.getElementById('ghostSpeed').addEventListener('input', function () {
  syncSpeedSliders(this.value);
});

/** Sync both sliders when Pac-Man speed changes */
document.getElementById('pacSpeed').addEventListener('input', function () {
  syncSpeedSliders(this.value);
});

/** Update the Pac-Man-size readout whenever the slider moves */
document.getElementById('pacScale').addEventListener('input', function () {
  document.getElementById('pacScaleVal').textContent =
    parseFloat(this.value).toFixed(1) + '×';
});

// =============================================================================
// BOOT – wired to the "Start Game" button in index.html
// =============================================================================

/**
 * startGame – reads the config panel, hides it, then launches Phaser.
 *
 * gameConfig is stored in the Phaser registry so every scene can read it
 * via:  this.registry.get('gameConfig')
 */
function startGame() {
  // Collect settings from the HTML controls
  const gameConfig = {
    lives:      parseInt(document.getElementById('lives').value, 10),
    pellets:    parseInt(document.getElementById('pellets').value, 10),
    ghostSpeed: parseFloat(document.getElementById('ghostSpeed').value),
    pacSpeed:   parseFloat(document.getElementById('pacSpeed').value),
    pacScale:   parseFloat(document.getElementById('pacScale').value),
    invincible: document.getElementById('invincible').checked,
  };

  // Swap UI: hide config panel, show game canvas wrapper
  document.getElementById('config-panel').style.display  = 'none';
  document.getElementById('game-container').style.display = 'block';

  // Phaser initialisation options
  const phaserConfig = {
    type:            Phaser.AUTO,          // WebGL → Canvas fallback
    width:           COLS * TILE_SIZE,     // 28 × 20 = 560 px
    height:          HUD_HEIGHT + ROWS * TILE_SIZE,  // 40 + 620 = 660 px
    backgroundColor: '#000000',
    parent:          'game-container',
    physics: {
      default: 'arcade',
      arcade:  { debug: false },
    },
    scene:           [GameScene, GameOverScene],
  };

  // Create the Phaser game instance and keep a reference for later
  // (Milestone 4 will call window.phaserGame.destroy() for Play Again)
  window.phaserGame = new Phaser.Game(phaserConfig);

  // Push gameConfig into the Phaser registry immediately — must happen before
  // any scene's create() runs, so we set it synchronously right after
  // construction rather than waiting for the 'ready' event (which fires after
  // create() and caused pacScale to always read as null / 1×).
  window.phaserGame.registry.set('gameConfig', gameConfig);
}
