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
//  0 = wall            solid blue block, impassable
//  1 = dot             small collectible pellet
//  2 = power pellet    large collectible, makes ghosts frightened
//  3 = empty           open corridor, no item
//  4 = ghost house     ghost starting area interior
// =============================================================================
const TILEMAP = [
  // Row 0 – top border wall
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Row 1 – top corridor (dots span both halves)
  [0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0],
  // Row 2 – upper left and right box walls
  [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
  // Row 3 – POWER PELLETS at cols 1 and 26
  [0,2,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,2,0],
  // Row 4
  [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
  // Row 5 – full-width horizontal corridor
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  // Row 6 – T-junctions at cols 6 and 21
  [0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0],
  // Row 7
  [0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0],
  // Row 8 – horizontal bars with gap above ghost house approach
  [0,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,0],
  // Row 9 – vertical connectors at col 6 and 21; corridor narrows
  [0,0,0,0,0,0,1,0,0,0,0,0,3,0,0,3,0,0,0,0,0,1,0,0,0,0,0,0],
  // Row 10
  [0,0,0,0,0,0,1,0,0,0,0,0,3,0,0,3,0,0,0,0,0,1,0,0,0,0,0,0],
  // Row 11 – horizontal corridor directly above ghost house
  [0,0,0,0,0,0,1,0,0,3,3,3,3,3,3,3,3,3,3,0,0,1,0,0,0,0,0,0],
  // Row 12 – ghost house top wall; door opening at cols 13–14
  [0,0,0,0,0,0,1,0,0,3,0,0,0,3,3,0,0,0,3,0,0,1,0,0,0,0,0,0],
  // Row 13 – TUNNEL exits at cols 0–5 and 22–27; ghost house interior
  [3,3,3,3,3,3,1,3,3,3,0,4,4,4,4,4,4,0,3,3,3,1,3,3,3,3,3,3],
  // Row 14 – ghost house interior (second row)
  [0,0,0,0,0,0,1,0,0,3,0,4,4,4,4,4,4,0,3,0,0,1,0,0,0,0,0,0],
  // Row 15 – corridor below ghost house
  [0,0,0,0,0,0,1,0,0,3,3,3,3,3,3,3,3,3,3,0,0,1,0,0,0,0,0,0],
  // Row 16
  [0,0,0,0,0,0,1,0,0,3,0,0,0,0,0,0,0,0,3,0,0,1,0,0,0,0,0,0],
  // Row 17 – horizontal corridor below ghost house
  [0,0,0,0,0,0,1,0,0,3,3,3,3,3,3,3,3,3,3,0,0,1,0,0,0,0,0,0],
  // Row 18 – lower half begins; mirrors row 1
  [0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0],
  // Row 19
  [0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0],
  // Row 20 – POWER PELLETS at cols 1 and 26
  [0,2,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,2,0],
  // Row 21 – Pac-Man start area; cols 13–14 are empty (no dot under spawn)
  [0,1,1,1,0,0,1,1,1,1,1,1,1,3,3,1,1,1,1,1,1,1,0,0,1,1,1,0],
  // Row 22 – vertical connectors at cols 3, 6, 9, 18, 21, 24
  [0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0],
  // Row 23
  [0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0],
  // Row 24 – horizontal bars below Pac-Man area
  [0,1,1,1,1,1,1,0,0,1,1,1,1,0,3,1,1,1,1,0,0,1,1,1,1,1,1,0],
  // Row 25 – large open area (Pac-Man starting room)
  [0,1,0,0,0,0,0,0,0,0,0,0,1,0,3,1,0,0,0,0,0,0,0,0,0,0,1,0],
  // Row 26
  [0,1,0,0,0,0,0,0,0,0,0,0,1,0,3,1,0,0,0,0,0,0,0,0,0,0,1,0],
  // Row 27 – wide bottom horizontal corridor
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  // Row 28 – two vertical corridors separated by center gap
  [0,1,0,0,0,0,1,0,0,0,0,0,0,0,3,0,0,0,0,0,0,1,0,0,0,0,1,0],
  // Row 29 – bottom corridor
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  // Row 30 – bottom border wall
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
    // A single Graphics object is used for all tile drawing.
    // Phaser batches fill calls so this stays efficient.
    const gfx = this.add.graphics();

    // Iterate every cell in the tilemap and draw the appropriate graphic
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        this._drawTile(gfx, row, col, TILEMAP[row][col]);
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
        // Dark-blue block; 1 px inset reveals the black background as a thin
        // gap between adjacent walls, giving a subtle grid / outline effect
        gfx.fillStyle(0x1919a6, 1);
        gfx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
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
