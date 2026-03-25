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

/** Column ghosts navigate to when exiting the ghost house */
const GHOST_EXIT_COL = 13;

/** Row ghosts must reach to be considered fully outside the ghost house */
const GHOST_EXIT_ROW = 11;

/** Scatter phase duration in ms — classic Level 1 timing */
const SCATTER_DURATION = 7000;

/** Chase phase duration in ms — classic Level 1 timing */
const CHASE_DURATION = 20000;

/** How long frightened mode lasts after a power pellet — classic Level 1 */
const FRIGHTENED_DURATION = 7000;

/** How many ms before frightened ends the ghost starts flashing blue ↔ white */
const FRIGHTENED_FLASH_START = 2000;

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
//
// ORIGINAL_TILEMAP is the immutable source of truth — never written to.
// TILEMAP is a per-game deep copy created in GameScene.create(); all dot/pellet
// removal mutates only TILEMAP so replaying restores a fresh copy.
// =============================================================================
// Accurate classic Pac-Man tilemap - 28 columns x 31 rows
// Mapped tile-by-tile from the original 1980 Namco arcade maze
// 0=wall, 1=dot, 2=power pellet, 3=empty, 4=ghost house
const ORIGINAL_TILEMAP = [
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

// Working copy — assigned a fresh deep copy at the start of every GameScene.
// All in-game tile mutations (eating dots/pellets) target this variable only.
let TILEMAP = [];

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

    // Ghost sprites — one canvas texture per ghost, all 30×30
    const ghostDefs = [
      { key: 'blinky', color: '#ff0000' },
      { key: 'pinky',  color: '#ffb8ff' },
      { key: 'inky',   color: '#00ffff' },
      { key: 'clyde',  color: '#ffb852' },
    ];
    for (const gd of ghostDefs) {
      const gc  = this.textures.createCanvas(gd.key, size, size);
      const gctx = gc.getContext();
      this._drawGhostTexture(gctx, gd.color, size);
      gc.refresh();
    }

    // Frightened ghost textures — shared by all ghosts during frightened mode.
    // ghost_frightened: solid blue body (normal frightened)
    // ghost_flash:      white body (used during the end-of-frightened flash)
    const gf  = this.textures.createCanvas('ghost_frightened', size, size);
    this._drawGhostTexture(gf.getContext(), '#0000cc', size);
    gf.refresh();

    const gfl = this.textures.createCanvas('ghost_flash', size, size);
    this._drawGhostTexture(gfl.getContext(), '#ffffff', size);
    gfl.refresh();
  }

  // ---------------------------------------------------------------------------
  // _drawGhostTexture – draws a classic Pac-Man ghost shape onto a 2D canvas.
  //
  // Shape construction (all coordinates relative to the size×size canvas):
  //   1. DOME  – a semicircle arcs across the full top of the sprite.
  //              Arc center sits at (cx, domeR) so the topmost point grazes y=0.
  //   2. SIDES – straight vertical lines descend from the dome's left/right
  //              edges down to bodyBottom.
  //   3. SKIRT – 3 scallops drawn as a zigzag (no curves, no recursion):
  //              alternating DOWN-peaks (scallop valleys) and UP-peaks back to
  //              bodyBottom; one valley at each third of the ghost width.
  //              closePath() closes the left side back to the dome edge.
  //   4. EYES  – two white filled circles with dark pupils in the dome's
  //              upper region, each pupil shifted slightly inward and down
  //              to give the classic "googly" look.
  //
  // @param {CanvasRenderingContext2D} ctx   Canvas context to draw on
  // @param {string}                  color CSS color string for the ghost body
  // @param {number}                  size  Canvas width and height in px
  // ---------------------------------------------------------------------------
  _drawGhostTexture(ctx, color, size) {
    const cx         = size / 2;           // horizontal center        = 15
    const domeR      = size / 2 - 1;       // dome semicircle radius   = 14
    const domeY      = domeR;              // dome arc center Y        = 14
    const bodyBottom = Math.round(size * 0.73); // straight sides end  ≈ 22
    const scalpTip   = size - 1;           // scallop valley depth     = 29
    const scalpStep  = size / 3;           // one scallop width        = 10

    // --- Body ---
    ctx.fillStyle = color;
    ctx.beginPath();

    // Dome: semicircle from left edge (cx-domeR, domeY) to right edge
    ctx.moveTo(cx - domeR, domeY);
    ctx.arc(cx, domeY, domeR, Math.PI, 0, false);  // ends at (cx+domeR, domeY)

    // Right side: straight down to bodyBottom
    ctx.lineTo(cx + domeR, bodyBottom);

    // Skirt: 3 zigzag scallops from right → left
    //   odd points dip DOWN to scalpTip, even points rise back to bodyBottom
    ctx.lineTo(cx + domeR - scalpStep * 0.5, scalpTip);   // right valley  x≈24
    ctx.lineTo(cx + domeR - scalpStep,       bodyBottom);  // rise          x≈19
    ctx.lineTo(cx,                           scalpTip);    // mid valley    x=15
    ctx.lineTo(cx - domeR + scalpStep,       bodyBottom);  // rise          x≈11
    ctx.lineTo(cx - domeR + scalpStep * 0.5, scalpTip);   // left valley   x≈6
    ctx.lineTo(cx - domeR,                   bodyBottom);  // final rise    x=1

    // closePath draws the left side straight up to the dome edge
    ctx.closePath();
    ctx.fill();

    // --- Eyes ---
    const eyeY    = Math.round(domeY * 0.65); // upper dome region     ≈ y=9
    const eyeOffX = size * 0.2;               // offset from center    = 6
    const eyeR    = size * 0.13;              // white circle radius   ≈ 3.9
    const pupilR  = eyeR * 0.55;             // pupil radius          ≈ 2.1

    // Left eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - eyeOffX, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000033';
    ctx.beginPath();
    ctx.arc(cx - eyeOffX + 1, eyeY + 1, pupilR, 0, Math.PI * 2);
    ctx.fill();

    // Right eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx + eyeOffX, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000033';
    ctx.beginPath();
    ctx.arc(cx + eyeOffX + 1, eyeY + 1, pupilR, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---------------------------------------------------------------------------
  // create – called once when the scene starts; draws the static maze
  // ---------------------------------------------------------------------------
  create() {
    // Reset the mutable tilemap from the immutable source so every new game
    // (including Play Again restarts) begins with a full set of dots/pellets.
    TILEMAP = ORIGINAL_TILEMAP.map(row => [...row]);

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

    // Ghost sprites — spawned before Pac-Man so he renders on top
    this._createGhosts();

    // Pac-Man sprite and keyboard input
    this._createPacman();
    this._setupInput();

    // Score counter — starts at zero, updated by _checkEatDot each frame
    this.score = 0;

    // Lives — read from config; decremented by handlePlayerDeath each death
    const cfg    = this.registry.get('gameConfig');
    this.lives   = cfg ? (cfg.lives ?? 3) : 3;

    // Death flag — while true the update loop is frozen (1-second respawn pause)
    this.dying = false;

    // Frightened mode state — activated when Pac-Man eats a power pellet.
    // isFrightened:      true while any ghost is in frightened mode
    // frightenedEndTime: absolute scene timestamp when frightened mode expires
    // frightenedTimer:   Phaser TimerEvent handle so re-eating a pellet can
    //                    cancel and replace the running timer
    // ghostEatMultiplier: doubles with each ghost eaten this frightened cycle
    //                     (200 → 400 → 800 → 1600), reset each new activation
    this.isFrightened       = false;
    this.frightenedEndTime  = 0;
    this.frightenedTimer    = null;
    this.ghostEatMultiplier = 1;

    // HUD – score display in the top strip above the maze (added last so it
    // renders on top of everything including Pac-Man)
    this.scoreText = this.add.text(10, 10, 'SCORE  0', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });

    // HUD – lives display, right-aligned in the same strip
    this.livesText = this.add.text(COLS * TILE_SIZE - 10, 10, 'LIVES  ' + this.lives, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(1, 0);
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
  // update – main game loop tick.
  //   Returns early while this.dying is true so that the 1-second respawn
  //   pause freezes all movement and collision without stopping the scene.
  // ---------------------------------------------------------------------------
  update(time, delta) {
    if (this.dying) return;

    this._handleMovement();
    this._checkEatDot();
    this._updatePacVisual(time);
    this._updateGhostMode(time);
    this._updateGhosts(time, delta);
    this._updateGhostVisuals(time);
    this._checkGhostCollision();
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
  // _createGhosts – spawns 4 ghost sprites in / near the ghost house.
  //
  //   Blinky (red)    – starts at row 11 (just above the house), scatter mode.
  //   Pinky  (pink)   – starts inside the house; exits after 3 s.
  //   Inky   (cyan)   – starts inside the house; exits after 6 s.
  //   Clyde  (orange) – starts inside the house; exits after 9 s.
  //
  //   Each ghost is a 16×16 colored rectangle — full art is v2 polish.
  //   Speed reads from gameConfig.ghostSpeed so the config slider works.
  // ---------------------------------------------------------------------------
  _createGhosts() {
    const cfg        = this.registry.get('gameConfig');
    const ghostSpeed = 60 * (cfg ? cfg.ghostSpeed : 1);  // px / s, ~3 tiles/s at 1×

    const defs = [
      {
        name: 'blinky', color: 0xff0000,
        scatterTarget: { row: 0,        col: COLS - 1 },
        startRow: 11,   startCol: 13,   exitDelay: 0,
      },
      {
        name: 'pinky',  color: 0xffb8ff,
        scatterTarget: { row: 0,        col: 0        },
        startRow: 14,   startCol: 13,   exitDelay: 3000,
      },
      {
        name: 'inky',   color: 0x00ffff,
        scatterTarget: { row: ROWS - 1, col: COLS - 1 },
        startRow: 14,   startCol: 11,   exitDelay: 6000,
      },
      {
        name: 'clyde',  color: 0xffb852,
        scatterTarget: { row: ROWS - 1, col: 0        },
        startRow: 14,   startCol: 15,   exitDelay: 9000,
      },
    ];

    this.ghosts = defs.map(def => {
      const { x, y } = this._tileCenter(def.startRow, def.startCol);
      // Classic ghost sprite drawn as a canvas texture in preload()
      const sprite = this.add.image(x, y, def.name);

      return {
        name:          def.name,
        color:         def.color,
        sprite:        sprite,
        tile:          { row: def.startRow, col: def.startCol },
        dir:           { dx: 0, dy: 0 },
        // Blinky exits immediately; others wait for their staggered delay
        state:         def.exitDelay === 0 ? 'scatter' : 'waiting',
        scatterTarget: def.scatterTarget,
        speed:         ghostSpeed,
        exitDelay:     def.exitDelay,
        // Stored so resetPositions() can teleport ghosts back to their origins
        startRow:      def.startRow,
        startCol:      def.startCol,
        // baseSpeed is the non-frightened speed; ghost.speed is halved during
        // frightened mode and restored to baseSpeed when frightened ends
        baseSpeed:     ghostSpeed,
      };
    });

    // Global scatter / chase mode — scatter starts first
    this.ghostMode     = 'scatter';
    this.gameStartTime = -1;  // captured on the first update() tick
    this.modeStartTime = -1;  // captured on the first update() tick
  }

  // ---------------------------------------------------------------------------
  // _updateGhostMode – drives the global scatter ↔ chase cycle each frame.
  //   On the first call it records the scene start time.  It then checks
  //   whether the current mode duration has expired and flips the mode if so.
  //   Every ghost already in the maze (state 'scatter' or 'chase') is updated
  //   to the new mode so they re-target immediately.
  // ---------------------------------------------------------------------------
  _updateGhostMode(time) {
    // Capture start time once on the first tick
    if (this.gameStartTime < 0) {
      this.gameStartTime = time;
      this.modeStartTime = time;
      return;
    }

    const elapsed      = time - this.modeStartTime;
    const modeDuration = this.ghostMode === 'scatter' ? SCATTER_DURATION : CHASE_DURATION;

    if (elapsed < modeDuration) return;  // still within current phase

    // Flip mode and restart the phase clock
    this.ghostMode     = this.ghostMode === 'scatter' ? 'chase' : 'scatter';
    this.modeStartTime = time;

    // Propagate new mode to ghosts already moving in the maze.
    // Frightened ghosts are left alone — they will rejoin the correct mode
    // naturally when _endFrightened() fires.
    for (const ghost of this.ghosts) {
      if (ghost.state === 'scatter' || ghost.state === 'chase') {
        ghost.state = this.ghostMode;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // _updateGhosts – per-frame ghost loop.
  //   Promotes any 'waiting' ghost to 'exiting' once its exit delay has passed,
  //   then calls _moveGhost for every ghost that is not still waiting.
  // ---------------------------------------------------------------------------
  _updateGhosts(time, delta) {
    for (const ghost of this.ghosts) {
      if (ghost.state === 'waiting') {
        if (time - this.gameStartTime < ghost.exitDelay) continue;  // not yet
        ghost.state = 'exiting';  // time to leave the house
      }

      this._moveGhost(ghost, delta);
    }
  }

  // ---------------------------------------------------------------------------
  // _moveGhost – advances one ghost toward its current target tile.
  //   Locks the perpendicular axis each frame to prevent sub-pixel drift, then
  //   moves the sprite by speed × delta along the current direction.
  //   When the ghost reaches the target tile centre (within SNAP px) it snaps
  //   exactly, calls _chooseNextGhostDir for the next move, and advances
  //   ghost.tile.  Handles horizontal tunnel wrap identically to Pac-Man.
  // ---------------------------------------------------------------------------
  _moveGhost(ghost, delta) {
    const SNAP = 4;  // px — within this distance counts as "at tile centre"
    const spr  = ghost.sprite;
    const { x: tx, y: ty } = this._tileCenter(ghost.tile.row, ghost.tile.col);

    // Lock the perpendicular axis to prevent drift over many frames
    if (ghost.dir.dx !== 0) spr.y = ty;
    if (ghost.dir.dy !== 0) spr.x = tx;

    // Advance along current direction
    spr.x += ghost.dir.dx * ghost.speed * (delta / 1000);
    spr.y += ghost.dir.dy * ghost.speed * (delta / 1000);

    // Horizontal tunnel wrap
    if      (spr.x < 0)               spr.x = COLS * TILE_SIZE;
    else if (spr.x > COLS * TILE_SIZE) spr.x = 0;

    // Snap check: close enough to target tile centre?
    const nearCenter = Math.abs(spr.x - tx) <= SNAP &&
                       Math.abs(spr.y - ty) <= SNAP;

    if (!nearCenter) return;

    // Lock to exact tile centre, then pick next direction
    spr.x = tx;
    spr.y = ty;

    const nextDir = this._chooseNextGhostDir(ghost);
    if (!nextDir) { ghost.dir = { dx: 0, dy: 0 }; return; }

    const nr = ghost.tile.row + nextDir.dy;
    const nc = ghost.tile.col + nextDir.dx;

    // Safety check — direction must lead to a passable tile
    if (!this._canGhostMoveTo(nr, nc, ghost)) {
      ghost.dir = { dx: 0, dy: 0 };
      return;
    }

    ghost.dir  = nextDir;
    ghost.tile = {
      row: ((nr % ROWS) + ROWS) % ROWS,
      col: ((nc % COLS) + COLS) % COLS,
    };
  }

  // ---------------------------------------------------------------------------
  // _chooseNextGhostDir – dispatcher that returns the next direction for a
  //   ghost at its current tile.
  //   Exiting ghosts are routed through _exitingDir; all others use
  //   _chooseDirToward with the mode-appropriate target tile.
  // ---------------------------------------------------------------------------
  _chooseNextGhostDir(ghost) {
    if (ghost.state === 'exiting')   return this._exitingDir(ghost);
    if (ghost.state === 'frightened') return this._chooseFrightenedDir(ghost);
    const target = this._getGhostTarget(ghost);
    return this._chooseDirToward(ghost, target.row, target.col);
  }

  // ---------------------------------------------------------------------------
  // _exitingDir – computes the next move for a ghost leaving the ghost house.
  //   Uses a simple two-step iterative rule (no recursion):
  //     1. Move horizontally until aligned with GHOST_EXIT_COL.
  //     2. Move up until reaching GHOST_EXIT_ROW.
  //     3. On arrival, transition the ghost to the current global mode.
  // ---------------------------------------------------------------------------
  _exitingDir(ghost) {
    const { row, col } = ghost.tile;

    // Step 1: reach the exit column
    if (col < GHOST_EXIT_COL) return { dx:  1, dy: 0 };
    if (col > GHOST_EXIT_COL) return { dx: -1, dy: 0 };

    // Step 2: move up to the exit row
    if (row > GHOST_EXIT_ROW) return { dx: 0, dy: -1 };

    // Step 3: fully exited — join the global scatter / chase mode
    ghost.state = this.ghostMode;
    const target = this._getGhostTarget(ghost);
    return this._chooseDirToward(ghost, target.row, target.col);
  }

  // ---------------------------------------------------------------------------
  // _getGhostTarget – returns the {row, col} tile a ghost should navigate to.
  //   scatter → the ghost's pre-assigned corner tile
  //   chase   → Pac-Man's current tile (derived from his pixel position)
  // ---------------------------------------------------------------------------
  _getGhostTarget(ghost) {
    if (ghost.state === 'scatter') {
      return ghost.scatterTarget;
    }
    // Chase: target the tile Pac-Man currently occupies
    const pacCol = Math.floor(this.pac.x / TILE_SIZE);
    const pacRow = Math.floor((this.pac.y - HUD_HEIGHT) / TILE_SIZE);
    return { row: pacRow, col: pacCol };
  }

  // ---------------------------------------------------------------------------
  // _chooseDirToward – picks the direction that minimises squared Euclidean
  //   distance from the adjacent tile to (targetRow, targetCol).
  //
  //   Classic Pac-Man AI rules (all applied iteratively — no recursion):
  //     • Ghosts cannot reverse 180° while another passable direction exists.
  //     • Cannot enter TILE.WALL tiles.
  //     • Can only enter TILE.GHOST_HOUSE while state === 'exiting'.
  //     • Ties broken by direction priority: up > left > down > right.
  // ---------------------------------------------------------------------------
  _chooseDirToward(ghost, targetRow, targetCol) {
    // Classic tie-breaking priority order (up, left, down, right)
    const DIRS = [
      { dx:  0, dy: -1 },  // up
      { dx: -1, dy:  0 },  // left
      { dx:  0, dy:  1 },  // down
      { dx:  1, dy:  0 },  // right
    ];

    const { row, col } = ghost.tile;
    const reverseDir   = { dx: -ghost.dir.dx, dy: -ghost.dir.dy };

    let bestDir  = null;
    let bestDist = Infinity;

    // First pass: consider all directions except a direct 180° reversal
    for (const dir of DIRS) {
      if (dir.dx === reverseDir.dx && dir.dy === reverseDir.dy) continue;

      const nr = row + dir.dy;
      const nc = col + dir.dx;
      if (!this._canGhostMoveTo(nr, nc, ghost)) continue;

      // Squared distance — no sqrt needed for relative comparison
      const dr   = nr - targetRow;
      const dc   = nc - targetCol;
      const dist = dr * dr + dc * dc;

      if (dist < bestDist) {
        bestDist = dist;
        bestDir  = dir;
      }
    }

    // Second pass: allow reversing only if no other direction was valid
    if (!bestDir) {
      const nr = row + reverseDir.dy;
      const nc = col + reverseDir.dx;
      if (this._canGhostMoveTo(nr, nc, ghost)) {
        bestDir = reverseDir;
      }
    }

    return bestDir;
  }

  // ---------------------------------------------------------------------------
  // _activateFrightened – called when Pac-Man eats a power pellet.
  //   Switches all active maze ghosts (scatter/chase) to 'frightened' state,
  //   halves their speed, and schedules _endFrightened after FRIGHTENED_DURATION.
  //   If frightened mode is already active (player ate a second pellet quickly),
  //   the existing timer is cancelled and the full duration restarts.
  //
  //   @param {number} now  Current scene timestamp in ms
  // ---------------------------------------------------------------------------
  _activateFrightened(now) {
    // Cancel the previous timer if frightened mode is already running
    if (this.frightenedTimer) {
      this.frightenedTimer.remove(false);
      this.frightenedTimer = null;
    }

    this.isFrightened      = true;
    this.frightenedEndTime = now + FRIGHTENED_DURATION;
    this.ghostEatMultiplier = 1;  // reset score multiplier for this cycle

    for (const ghost of this.ghosts) {
      if (ghost.state === 'scatter' || ghost.state === 'chase') {
        ghost.state = 'frightened';
        ghost.speed = ghost.baseSpeed * 0.5;
      }
    }

    // Schedule the automatic end of frightened mode
    this.frightenedTimer = this.time.delayedCall(
      FRIGHTENED_DURATION,
      () => { this._endFrightened(); },
    );
  }

  // ---------------------------------------------------------------------------
  // _endFrightened – restores all frightened ghosts to the current global mode
  //   (scatter or chase) and resets their speed.  Safe to call at any time,
  //   including mid-game death/respawn — it's a no-op if not currently active.
  // ---------------------------------------------------------------------------
  _endFrightened() {
    // Cancel a pending timer (e.g. called early by resetPositions)
    if (this.frightenedTimer) {
      this.frightenedTimer.remove(false);
      this.frightenedTimer = null;
    }

    this.isFrightened = false;

    for (const ghost of this.ghosts) {
      if (ghost.state === 'frightened') {
        ghost.state = this.ghostMode;   // rejoin whichever phase the cycle is in
        ghost.speed = ghost.baseSpeed;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // _chooseFrightenedDir – picks a random valid direction for a frightened ghost.
  //   Applies the same passability rules as normal movement (no walls, no ghost
  //   house) but ignores all targeting — pure random choice from open exits.
  //   180° reversal is still forbidden unless it is the only exit, matching the
  //   classic arcade behaviour.
  //
  //   @param  {object} ghost  Ghost state object
  //   @return {object|null}   { dx, dy } direction, or null if completely stuck
  // ---------------------------------------------------------------------------
  _chooseFrightenedDir(ghost) {
    const DIRS = [
      { dx:  0, dy: -1 },  // up
      { dx: -1, dy:  0 },  // left
      { dx:  0, dy:  1 },  // down
      { dx:  1, dy:  0 },  // right
    ];

    const { row, col } = ghost.tile;
    const reverseDir   = { dx: -ghost.dir.dx, dy: -ghost.dir.dy };

    // Collect all forward-valid exits (no reversals)
    const forwardDirs = [];
    for (const dir of DIRS) {
      if (dir.dx === reverseDir.dx && dir.dy === reverseDir.dy) continue;
      if (this._canGhostMoveTo(row + dir.dy, col + dir.dx, ghost)) {
        forwardDirs.push(dir);
      }
    }

    if (forwardDirs.length > 0) {
      // Pick randomly from valid forward exits
      return forwardDirs[Math.floor(Math.random() * forwardDirs.length)];
    }

    // Dead end — allow reversing as a last resort
    const nr = row + reverseDir.dy;
    const nc = col + reverseDir.dx;
    if (this._canGhostMoveTo(nr, nc, ghost)) return reverseDir;

    return null;  // completely boxed in (should not happen in this maze)
  }

  // ---------------------------------------------------------------------------
  // _eatGhost – handles Pac-Man consuming a frightened ghost.
  //   Awards points using the current multiplier (200, 400, 800, 1600…),
  //   doubles the multiplier for the next ghost eaten this cycle,
  //   teleports the ghost back to its starting position, and sets it to
  //   'exiting' so it immediately begins the path back into the maze.
  //
  //   @param {object} ghost  Ghost state object to consume
  // ---------------------------------------------------------------------------
  _eatGhost(ghost) {
    const points = 200 * this.ghostEatMultiplier;
    this.ghostEatMultiplier *= 2;

    this.score += points;
    this.scoreText.setText('SCORE  ' + this.score);

    // Teleport ghost back to ghost house start position
    const { x, y } = this._tileCenter(ghost.startRow, ghost.startCol);
    ghost.sprite.setPosition(x, y);
    ghost.tile  = { row: ghost.startRow, col: ghost.startCol };
    ghost.dir   = { dx: 0, dy: 0 };

    // 'exiting' causes the ghost to navigate out of the house normally;
    // speed is restored immediately so it re-enters the maze at full speed
    ghost.state = 'exiting';
    ghost.speed = ghost.baseSpeed;
  }

  // ---------------------------------------------------------------------------
  // _updateGhostVisuals – called every frame to sync each ghost sprite to the
  //   correct texture for its current state.
  //   • Normal states (scatter/chase/exiting/waiting) → original named texture
  //   • Frightened with > FRIGHTENED_FLASH_START ms remaining → ghost_frightened
  //   • Frightened with ≤ FRIGHTENED_FLASH_START ms remaining → alternates
  //     ghost_frightened / ghost_flash at ~4 Hz (every 250 ms)
  //
  //   @param {number} time  Current scene timestamp in ms
  // ---------------------------------------------------------------------------
  _updateGhostVisuals(time) {
    for (const ghost of this.ghosts) {
      if (ghost.state !== 'frightened') {
        ghost.sprite.setTexture(ghost.name);
        continue;
      }

      const remaining = this.frightenedEndTime - time;
      if (remaining > FRIGHTENED_FLASH_START) {
        // Solid blue
        ghost.sprite.setTexture('ghost_frightened');
      } else {
        // Flash between blue and white every 250 ms
        const flashKey = Math.floor(time / 250) % 2 === 0
          ? 'ghost_frightened'
          : 'ghost_flash';
        ghost.sprite.setTexture(flashKey);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // _canGhostMoveTo – returns true if a ghost can enter the tile at (row, col).
  //   TILE.WALL is always impassable.
  //   TILE.GHOST_HOUSE is only passable while the ghost's state is 'exiting'.
  //   Columns outside [0, COLS) are tunnel exits — always passable.
  // ---------------------------------------------------------------------------
  _canGhostMoveTo(row, col, ghost) {
    if (col < 0 || col >= COLS) return true;   // horizontal tunnel exits
    if (row < 0 || row >= ROWS) return false;

    const tile = TILEMAP[row][col];
    if (tile === TILE.WALL)        return false;
    if (tile === TILE.GHOST_HOUSE) return ghost.state === 'exiting';
    return true;
  }

  // ---------------------------------------------------------------------------
  // _checkGhostCollision – called every frame after all movement updates.
  //   Derives Pac-Man's current tile and compares it against every ghost tile.
  //   Only ghosts in 'scatter' or 'chase' state can hurt Pac-Man — ghosts that
  //   are still 'waiting' or 'exiting' pass through harmlessly.
  //   Frightened mode (Milestone 6) will add a branch here on ghost.state.
  //   Fires handlePlayerDeath() on the first matching ghost and returns early
  //   so only one death event fires per frame.
  // ---------------------------------------------------------------------------
  _checkGhostCollision() {
    const pacCol = Math.floor(this.pac.x / TILE_SIZE);
    const pacRow = Math.floor((this.pac.y - HUD_HEIGHT) / TILE_SIZE);

    for (const ghost of this.ghosts) {
      if (ghost.tile.row !== pacRow || ghost.tile.col !== pacCol) continue;

      if (ghost.state === 'frightened') {
        // Pac-Man eats the frightened ghost — score and reset it to the house
        this._eatGhost(ghost);
        // Do NOT return — Pac-Man can eat multiple ghosts on the same tile
        continue;
      }

      // Only active maze ghosts can kill Pac-Man
      if (ghost.state !== 'scatter' && ghost.state !== 'chase') continue;

      this.handlePlayerDeath();
      return;  // one death per frame — stop checking remaining ghosts
    }
  }

  // ---------------------------------------------------------------------------
  // handlePlayerDeath – responds to a Pac-Man / ghost collision.
  //   Does nothing when invincible mode is enabled in gameConfig.
  //   Otherwise: freezes the update loop, decrements lives, then either
  //   transitions to GameOverScene (lives exhausted) or schedules a 1-second
  //   pause before resetPositions() restores starting state.
  // ---------------------------------------------------------------------------
  handlePlayerDeath() {
    const cfg = this.registry.get('gameConfig');
    if (cfg && cfg.invincible) return;  // invincible mode — skip death entirely

    this.dying = true;  // freeze update loop immediately

    // Stop Pac-Man instantly — clear velocity and queued directions so the
    // physics body doesn't drift between this frame and the next update tick.
    this.pac.setVelocity(0, 0);
    this.pacDir    = { dx: 0, dy: 0 };
    this.queuedDir = null;

    this.lives -= 1;
    this.livesText.setText('LIVES  ' + this.lives);

    if (this.lives <= 0) {
      // No lives left — hand off to the Game Over screen with final score
      this.scene.start('GameOverScene', { score: this.score });
      return;
    }

    // Still have lives — brief pause, then reset positions and resume
    this.time.delayedCall(1000, () => { this.resetPositions(); });
  }

  // ---------------------------------------------------------------------------
  // resetPositions – teleports Pac-Man and all ghosts back to their starting
  //   tiles without touching the score or the tilemap (eaten dots stay gone).
  //   Resets all movement state and restarts the scatter/chase timing cycle.
  //   Clears this.dying at the end to re-enable the update loop.
  // ---------------------------------------------------------------------------
  resetPositions() {
    // --- Pac-Man ---
    const PAC_START_ROW = 23;
    const PAC_START_COL = 13;
    const { x: px, y: py } = this._tileCenter(PAC_START_ROW, PAC_START_COL);

    this.pac.setPosition(px, py);
    this.pac.setVelocity(0, 0);
    this.pacTile   = { row: PAC_START_ROW, col: PAC_START_COL };
    this.pacDir    = { dx: 0, dy: 0 };
    this.queuedDir = null;

    // --- Ghosts — teleport each back to its original start tile ---
    for (const ghost of this.ghosts) {
      const { x: gx, y: gy } = this._tileCenter(ghost.startRow, ghost.startCol);
      ghost.sprite.setPosition(gx, gy);
      ghost.tile  = { row: ghost.startRow, col: ghost.startCol };
      ghost.dir   = { dx: 0, dy: 0 };
      ghost.state = ghost.exitDelay === 0 ? 'scatter' : 'waiting';
    }

    // Cancel any active frightened mode — a death/respawn ends it immediately
    this._endFrightened();

    // Restart the scatter/chase cycle and ghost exit timers from now
    const now          = this.time.now;
    this.gameStartTime = now;
    this.modeStartTime = now;
    this.ghostMode     = 'scatter';

    this.dying = false;  // re-enable the update loop
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

    // Power pellet — activate frightened mode for all active ghosts
    if (type === TILE.PELLET) {
      this._activateFrightened(this.time.now);
    }

    // Win condition — all dots and pellets cleared
    if (this.dotSprites.size === 0) {
      this._handleWin();
    }
  }

  // ---------------------------------------------------------------------------
  // _handleWin – called the moment the last dot/pellet is eaten.
  //   Freezes the update loop (same flag as death), stops Pac-Man, then after
  //   a 1-second pause transitions to GameOverScene with won: true.
  // ---------------------------------------------------------------------------
  _handleWin() {
    this.dying = true;  // freeze update loop — reuses death flag, no extra state

    this.pac.setVelocity(0, 0);
    this.pacDir    = { dx: 0, dy: 0 };
    this.queuedDir = null;

    this.time.delayedCall(1000, () => {
      this.scene.start('GameOverScene', { score: this.score, won: true });
    });
  }
}

// =============================================================================
// GAME OVER SCENE
// =============================================================================

class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  // ---------------------------------------------------------------------------
  // init – receives data passed from GameScene.scene.start('GameOverScene', …).
  //   Stores the final score so create() can display it.
  // ---------------------------------------------------------------------------
  init(data) {
    this.finalScore = data.score ?? 0;
    this.won        = data.won   ?? false;
  }

  // ---------------------------------------------------------------------------
  // create – builds the Game Over screen:
  //   • "GAME OVER" heading centred in the upper third
  //   • Final score line below it
  //   • "PLAY AGAIN" button — clicking it destroys Phaser and restores the
  //     HTML config panel so the player can start a fresh game.
  // ---------------------------------------------------------------------------
  create() {
    const cx = (COLS * TILE_SIZE) / 2;
    const cy = (HUD_HEIGHT + ROWS * TILE_SIZE) / 2;

    // Heading — "YOU WIN!" or "GAME OVER" depending on outcome
    const headingText  = this.won ? 'YOU WIN!'  : 'GAME OVER';
    const headingColor = this.won ? '#00ff00'   : '#ff0000';
    this.add.text(cx, cy - 60, headingText, {
      fontSize:   '40px',
      color:      headingColor,
      fontFamily: 'monospace',
      fontStyle:  'bold',
    }).setOrigin(0.5);

    // Final score
    this.add.text(cx, cy, 'SCORE  ' + this.finalScore, {
      fontSize:   '24px',
      color:      '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // "Play Again" button — interactive Phaser text object
    const btn = this.add.text(cx, cy + 60, 'PLAY AGAIN', {
      fontSize:   '22px',
      color:      '#ffff00',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Hover feedback — brighten / dim on pointer over / out
    btn.on('pointerover',  () => btn.setColor('#ffffff'));
    btn.on('pointerout',   () => btn.setColor('#ffff00'));

    // Click: destroy Phaser and show the HTML config panel again
    btn.on('pointerdown', () => {
      window.phaserGame.destroy(true);
      document.getElementById('game-container').style.display = 'none';
      document.getElementById('config-panel').style.display  = 'block';
    });
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