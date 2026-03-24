// =============================================================================
// CONSTANTS
// =============================================================================

/** Pixel size of each square tile */
const TILE_SIZE = 20;

/** Tilemap dimensions */
const COLS = 28;
const ROWS = 31;

/** Pixels reserved above the maze for the score HUD */
const HUD_HEIGHT = 40;

/** Tile type identifiers — used throughout all scenes */
const TILE = {
  WALL:        0,
  DOT:         1,
  PELLET:      2,
  EMPTY:       3,
  GHOST_HOUSE: 4,
};

// =============================================================================
// TILEMAP  (28 columns × 31 rows)
//
// Accurate classic Pac-Man layout (Namco, 1980)
// 240 dots + 4 power pellets = 244 collectibles
//
//  0 = wall            solid blue block, impassable
//  1 = dot             small collectible pellet
//  2 = power pellet    large collectible, makes ghosts frightened
//  3 = empty           open corridor, no item
//  4 = ghost house     ghost starting area interior
// =============================================================================
// Accurate classic Pac-Man tilemap - 28 columns x 31 rows
// Mapped tile-by-tile from the original 1980 Namco arcade maze
// 0=wall, 1=dot, 2=power pellet, 3=empty, 4=ghost house
const TILEMAP = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
  [0,2,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,2,0],
  [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0],
  [0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0],
  [0,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,1,0,0,0,0,0,3,0,0,3,0,0,0,0,0,1,0,0,0,0,0,0],
  [3,3,3,3,3,0,1,0,0,0,0,0,3,0,0,3,0,0,0,0,0,1,0,3,3,3,3,3],
  [3,3,3,3,3,0,1,0,0,3,3,3,3,3,3,3,3,3,3,0,0,1,0,3,3,3,3,3],
  [3,3,3,3,3,0,1,0,0,3,0,0,0,3,3,0,0,0,3,0,0,1,0,3,3,3,3,3],
  [0,0,0,0,0,0,1,0,0,3,0,4,4,4,4,4,4,0,3,0,0,1,0,0,0,0,0,0],
  [3,3,3,3,3,3,1,3,3,3,0,4,4,4,4,4,4,0,3,3,3,1,3,3,3,3,3,3],
  [0,0,0,0,0,0,1,0,0,3,0,4,4,4,4,4,4,0,3,0,0,1,0,0,0,0,0,0],
  [3,3,3,3,3,0,1,0,0,3,0,0,0,0,0,0,0,0,3,0,0,1,0,3,3,3,3,3],
  [3,3,3,3,3,0,1,0,0,3,3,3,3,3,3,3,3,3,3,0,0,1,0,3,3,3,3,3],
  [3,3,3,3,3,0,1,0,0,3,0,0,0,0,0,0,0,0,3,0,0,1,0,3,3,3,3,3],
  [0,0,0,0,0,0,1,0,0,3,0,0,0,0,0,0,0,0,3,0,0,1,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
  [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
  [0,2,1,1,0,0,1,1,1,1,1,1,1,3,3,1,1,1,1,1,1,1,0,0,1,1,2,0],
  [0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0],
  [0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0],
  [0,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,0],
  [0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0],
  [0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// =============================================================================
// GAME SCENE
// =============================================================================

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  // ---------------------------------------------------------------------------
  // preload – load external assets (none in Milestone 1; sprites added later)
  // ---------------------------------------------------------------------------
  preload() {}

  // ---------------------------------------------------------------------------
  // create – called once when the scene starts; draws the static maze
  // ---------------------------------------------------------------------------
  create() {
    const gfx = this.add.graphics();
    const PATH_SIZE = 35;  // black squares on path tiles, larger than TILE_SIZE
    const pathOffset = (PATH_SIZE - TILE_SIZE) / 2;  // 2.5px overhang on each side

    // --- Layer 1: Draw all wall tiles as solid blue 20×20 blocks ---
    gfx.fillStyle(0x1919a6, 1);
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (TILEMAP[row][col] === TILE.WALL) {
          const x = col * TILE_SIZE;
          const y = HUD_HEIGHT + row * TILE_SIZE;
          gfx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // --- Layer 2: Draw 25×25 black squares on every non-wall tile ---
    // These carve into adjacent wall tiles, making corridors wider.
    gfx.fillStyle(0x000000, 1);
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (TILEMAP[row][col] !== TILE.WALL) {
          const x = col * TILE_SIZE;
          const y = HUD_HEIGHT + row * TILE_SIZE;
          gfx.fillRect(x - pathOffset, y - pathOffset, PATH_SIZE, PATH_SIZE);
        }
      }
    }

    // --- Layer 3: Draw dots, pellets, ghost house on top ---
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const type = TILEMAP[row][col];
        const x  = col * TILE_SIZE;
        const y  = HUD_HEIGHT + row * TILE_SIZE;
        const cx = x + TILE_SIZE / 2;
        const cy = y + TILE_SIZE / 2;

        switch (type) {
          case TILE.DOT:
            gfx.fillStyle(0xffb8ae, 1);
            gfx.fillCircle(cx, cy, 2);
            break;
          case TILE.PELLET:
            gfx.fillStyle(0xffffff, 1);
            gfx.fillCircle(cx, cy, 5);
            break;
          case TILE.GHOST_HOUSE:
            gfx.fillStyle(0x200030, 1);
            gfx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            break;
        }
      }
    }

    // HUD – score display in the top strip above the maze
    this.scoreText = this.add.text(10, 10, 'SCORE  0', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
  }

  // ---------------------------------------------------------------------------
  // _drawTile – render one tile at (row, col) with the correct visual
  //
  //   gfx  – shared Phaser Graphics layer
  //   row  – tilemap row  (0 = top)
  //   col  – tilemap column  (0 = left)
  //   type – tile value from TILE constant
  // ---------------------------------------------------------------------------
  _drawTile(gfx, row, col, type) {
    // Top-left pixel of this tile; maze is offset below the HUD bar
    const x    = col * TILE_SIZE;
    const y    = HUD_HEIGHT + row * TILE_SIZE;
    const cx   = x + TILE_SIZE / 2;  // center x
    const cy   = y + TILE_SIZE / 2;  // center y

    switch (type) {

      case TILE.WALL:
        gfx.fillStyle(0x1919a6, 1);
        gfx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        break;

      case TILE.DOT:
        // Small cream-coloured dot centred in the tile
        gfx.fillStyle(0xffb8ae, 1);
        gfx.fillCircle(cx, cy, 2);
        break;

      case TILE.PELLET:
        // Larger bright-white power pellet; players will learn to seek these out
        gfx.fillStyle(0xffffff, 1);
        gfx.fillCircle(cx, cy, 5);
        break;

      case TILE.GHOST_HOUSE:
        // Ghost house interior gets a faint purple tint so it reads differently
        // from plain empty corridors at a glance
        gfx.fillStyle(0x200030, 1);
        gfx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        break;

      // TILE.EMPTY (3): black background shows through — nothing to draw
    }
  }

  // ---------------------------------------------------------------------------
  // update – main game loop tick (empty for Milestone 1)
  // ---------------------------------------------------------------------------
  update() {}
}

// =============================================================================
// CONFIG PANEL – live label sync for range sliders
// =============================================================================

/** Update the ghost-speed readout whenever the slider moves */
document.getElementById('ghostSpeed').addEventListener('input', function () {
  document.getElementById('ghostSpeedVal').textContent =
    parseFloat(this.value).toFixed(1) + '×';
});

/** Update the Pac-Man-speed readout whenever the slider moves */
document.getElementById('pacSpeed').addEventListener('input', function () {
  document.getElementById('pacSpeedVal').textContent =
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
    scene:           [GameScene],
  };

  // Create the Phaser game instance and keep a reference for later
  // (Milestone 4 will call window.phaserGame.destroy() for Play Again)
  window.phaserGame = new Phaser.Game(phaserConfig);

  // Push gameConfig into the Phaser registry once the engine is ready
  window.phaserGame.events.once('ready', () => {
    window.phaserGame.registry.set('gameConfig', gameConfig);
  });
}