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
  // preload – generate Pac-Man canvas textures before create() runs.
  //
  //   pac_open   – yellow wedge with mouth cut (facing right at angle 0)
  //   pac_closed – full yellow circle
  //
  // Both are 20×20 px CanvasTextures baked into the TextureManager so the
  // physics sprite can swap between them for mouth animation.
  // ---------------------------------------------------------------------------
  preload() {
    const size = 30;
    const r    = size / 2 - 1;

    // pac_open: pie-slice with ~23° mouth opening on each side
    const c1   = this.textures.createCanvas('pac_open', size, size);
    const ctx1 = c1.getContext();
    ctx1.fillStyle = '#ffff00';
    ctx1.beginPath();
    ctx1.moveTo(size / 2, size / 2);
    ctx1.arc(size / 2, size / 2, r, 0.4, Math.PI * 2 - 0.4);
    ctx1.closePath();
    ctx1.fill();
    c1.refresh();

    // pac_closed: full circle — alternates with pac_open for chomp animation
    const c2   = this.textures.createCanvas('pac_closed', size, size);
    const ctx2 = c2.getContext();
    ctx2.fillStyle = '#ffff00';
    ctx2.beginPath();
    ctx2.arc(size / 2, size / 2, r, 0, Math.PI * 2);
    ctx2.fill();
    c2.refresh();
  }

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

    // --- Layer 3: Ghost house drawn in gfx; dots/pellets as individual
    //     destroyable circle objects stored in this.dotSprites ---
    this.dotSprites = new Map(); // key: "row,col" → Phaser Arc game object

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const type = TILEMAP[row][col];
        const x  = col * TILE_SIZE;
        const y  = HUD_HEIGHT + row * TILE_SIZE;
        const cx = x + TILE_SIZE / 2;
        const cy = y + TILE_SIZE / 2;

        switch (type) {
          case TILE.DOT: {
            const dot = this.add.circle(cx, cy, 2, 0xffb8ae);
            this.dotSprites.set(`${row},${col}`, dot);
            break;
          }
          case TILE.PELLET: {
            const pellet = this.add.circle(cx, cy, 5, 0xffffff);
            this.dotSprites.set(`${row},${col}`, pellet);
            break;
          }
          case TILE.GHOST_HOUSE:
            gfx.fillStyle(0x200030, 1);
            gfx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            break;
        }
      }
    }

    // Pac-Man sprite and keyboard input
    this._createPacman();
    this._setupInput();

    // Score counter — starts at zero, updated by _checkEatDot each frame
    this.score = 0;

    // HUD – score display in the top strip above the maze (added last so it
    // renders on top of everything including Pac-Man)
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
  // update – main game loop tick
  // ---------------------------------------------------------------------------
  update(time, delta) {
    this._handleMovement();
    this._checkEatDot();
    this._updatePacVisual(time);
  }

  // ---------------------------------------------------------------------------
  // _tileCenter – returns the pixel centre {x, y} of a tile.
  //   row – tilemap row  (0 = top)
  //   col – tilemap column  (0 = left)
  // ---------------------------------------------------------------------------
  _tileCenter(row, col) {
    return {
      x: col * TILE_SIZE + TILE_SIZE / 2,
      y: HUD_HEIGHT + row * TILE_SIZE + TILE_SIZE / 2,
    };
  }

  // ---------------------------------------------------------------------------
  // _canMoveTo – returns true if Pac-Man can enter the tile at (row, col).
  //   TILE.WALL blocks movement.
  //   Columns outside [0, COLS) are the horizontal tunnel — always passable.
  // ---------------------------------------------------------------------------
  _canMoveTo(row, col) {
    if (col < 0 || col >= COLS) return true;   // horizontal tunnel exits
    if (row < 0 || row >= ROWS) return false;
    return TILEMAP[row][col] !== TILE.WALL;
  }

  // ---------------------------------------------------------------------------
  // _createPacman – spawns the Arcade Physics sprite and initialises all
  //   movement state.  Classic start: row 23, col 13 (open corridor just below
  //   the ghost house, matching the original Namco layout).
  //   Speed reads from gameConfig.pacSpeed so the config slider works.
  // ---------------------------------------------------------------------------
  _createPacman() {
    const START_ROW = 23;
    const START_COL = 13;
    const { x, y } = this._tileCenter(START_ROW, START_COL);

    this.pac = this.physics.add.sprite(x, y, 'pac_open');

    const cfg      = this.registry.get('gameConfig');
    const pacScale = cfg ? (cfg.pacScale ?? 1) : 1;
    this.pac.setScale(pacScale);
    this.pac.body.setSize(14 * pacScale, 14 * pacScale);

    // this.pacTile tracks the tile Pac-Man is currently heading toward
    this.pacTile = { row: START_ROW, col: START_COL };

    // Active movement direction (dx/dy = ±1, or 0 when stopped)
    this.pacDir = { dx: 0, dy: 0 };

    // Most recent arrow-key press; tried first at each intersection (cornering)
    this.queuedDir = null;

    // Base 80 px/s × config multiplier; ~4 tiles per second at 1×
    this.pacSpeed = 80 * (cfg ? cfg.pacSpeed : 1);
  }

  // ---------------------------------------------------------------------------
  // _setupInput – creates the cursor-key set used in _handleMovement.
  // ---------------------------------------------------------------------------
  _setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  // ---------------------------------------------------------------------------
  // _applyVelocity – pushes pacDir × pacSpeed into the physics body.
  // ---------------------------------------------------------------------------
  _applyVelocity() {
    this.pac.setVelocity(
      this.pacDir.dx * this.pacSpeed,
      this.pacDir.dy * this.pacSpeed,
    );
  }

  // ---------------------------------------------------------------------------
  // _handleMovement – called every frame.  Implements tile-to-tile movement
  //   with classic Pac-Man cornering ("pre-turn") input buffering.
  //
  //   How it works:
  //     1. The most recently held arrow key is buffered as queuedDir.
  //     2. When Pac-Man's position snaps to the current target tile centre it
  //        tries queuedDir first (pre-turn), then pacDir (keep going).
  //     3. If neither direction is open, Pac-Man stops.
  //     4. pacTile is always the *next* tile Pac-Man is heading toward so the
  //        snap check compares against that tile's pixel centre.
  //
  //   Wall detection uses the TILEMAP array — no physics static bodies needed.
  //   This sidesteps the 35 px visual corridor vs 20 px tile-grid mismatch.
  // ---------------------------------------------------------------------------
  _handleMovement() {
    const c = this.cursors;

    // --- 1. Buffer the most recently held arrow key ---
    if      (c.left.isDown)  this.queuedDir = { dx: -1, dy:  0 };
    else if (c.right.isDown) this.queuedDir = { dx:  1, dy:  0 };
    else if (c.up.isDown)    this.queuedDir = { dx:  0, dy: -1 };
    else if (c.down.isDown)  this.queuedDir = { dx:  0, dy:  1 };

    // --- 2. Snap check: has Pac-Man reached the target tile centre? ---
    const { x: tx, y: ty } = this._tileCenter(this.pacTile.row, this.pacTile.col);
    const SNAP = 3; // px — within this distance counts as "arrived"

    const nearCenter = Math.abs(this.pac.x - tx) <= SNAP &&
                       Math.abs(this.pac.y - ty) <= SNAP;

    if (nearCenter) {
      this.pac.setPosition(tx, ty); // lock exactly to tile centre

      // Candidate directions: queued (cornering) then current
      const dirs = this.queuedDir
        ? [this.queuedDir, this.pacDir]
        : [this.pacDir];

      let moved = false;
      for (const dir of dirs) {
        if (dir.dx === 0 && dir.dy === 0) continue; // not yet moving

        const nr = this.pacTile.row + dir.dy;
        const nc = this.pacTile.col + dir.dx;

        if (this._canMoveTo(nr, nc)) {
          // Consume queuedDir if that's the one we're using
          if (this.queuedDir && dir === this.queuedDir) {
            this.pacDir    = { ...this.queuedDir };
            this.queuedDir = null;
          }
          // Advance target tile; modulo handles tunnel wrap
          this.pacTile = {
            row: ((nr % ROWS) + ROWS) % ROWS,
            col: ((nc % COLS) + COLS) % COLS,
          };
          this._applyVelocity();
          moved = true;
          break;
        }
      }

      if (!moved) {
        this.pac.setVelocity(0, 0);
      }
    }

    // --- 3. Tunnel position wrap ---
    // pacTile is already wrapped above; here we teleport the pixel position
    // so Pac-Man slides smoothly out one side and in the other.
    if (this.pac.x < 0) {
      this.pac.x = COLS * TILE_SIZE;
    } else if (this.pac.x > COLS * TILE_SIZE) {
      this.pac.x = 0;
    }
  }

  // ---------------------------------------------------------------------------
  // _updatePacVisual – animates the mouth and rotates the sprite each frame.
  //   When stopped, Pac-Man shows an open mouth (classic waiting pose).
  //   When moving, the mouth toggles open/closed at ~5 Hz.
  //   The sprite is rotated so the mouth faces the direction of travel.
  // ---------------------------------------------------------------------------
  _updatePacVisual(time) {
    const moving = this.pac.body.speed > 1;

    // Mouth animation: open when stopped; chomp at ~5 Hz when moving
    this.pac.setTexture(
      (!moving || Math.floor(time / 100) % 2 === 0) ? 'pac_open' : 'pac_closed'
    );

    // Rotate to face direction of travel (pac_open wedge points right at 0°)
    if      (this.pacDir.dx ===  1) this.pac.setAngle(0);
    else if (this.pacDir.dx === -1) this.pac.setAngle(180);
    else if (this.pacDir.dy === -1) this.pac.setAngle(270);
    else if (this.pacDir.dy ===  1) this.pac.setAngle(90);
  }

  // ---------------------------------------------------------------------------
  // _checkEatDot – called every frame; derives Pac-Man's current tile from his
  //   pixel position and checks whether it holds a dot (type 1) or power pellet
  //   (type 2).  If so:
  //     • the corresponding Arc sprite is destroyed and removed from dotSprites
  //     • TILEMAP is updated to TILE.EMPTY so the tile cannot be re-eaten
  //     • score is incremented (10 for dot, 50 for pellet) and scoreText synced
  // ---------------------------------------------------------------------------
  _checkEatDot() {
    // Convert Pac-Man's pixel centre to tile coordinates
    const col = Math.floor(this.pac.x / TILE_SIZE);
    const row = Math.floor((this.pac.y - HUD_HEIGHT) / TILE_SIZE);

    // Skip if off-grid (e.g. inside the tunnel exit regions)
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;

    const type = TILEMAP[row][col];
    if (type !== TILE.DOT && type !== TILE.PELLET) return;

    // Destroy the individual dot/pellet sprite
    const key    = `${row},${col}`;
    const sprite = this.dotSprites.get(key);
    if (sprite) {
      sprite.destroy();
      this.dotSprites.delete(key);
    }

    // Mark tile empty so it cannot be eaten again this session
    TILEMAP[row][col] = TILE.EMPTY;

    // Award points and refresh the HUD
    this.score += (type === TILE.PELLET) ? 50 : 10;
    this.scoreText.setText('SCORE  ' + this.score);
  }
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
    scene:           [GameScene],
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