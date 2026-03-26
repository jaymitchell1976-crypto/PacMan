// =============================================================================
// GHOSTS MIXIN — creation, mode cycle, movement, AI, and visuals
// =============================================================================

Object.assign(GameScene.prototype, {

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
  },

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
  },

  // ---------------------------------------------------------------------------
  // _updateGhosts – per-frame ghost loop.
  //   Promotes any 'waiting' ghost to 'exiting' once its exit delay has passed,
  //   then calls _moveGhost for every ghost that is not still waiting.
  // ---------------------------------------------------------------------------
  _updateGhosts(time, delta) {
    for (const ghost of this.ghosts) {
      if (ghost.state === 'waiting') {
        // forcedWaiting is set after a ghost returns to its start tile;
        // a 500 ms delayedCall will clear it and transition to 'exiting'.
        if (ghost.forcedWaiting) continue;
        if (time - this.gameStartTime < ghost.exitDelay) continue;  // not yet
        ghost.state = 'exiting';  // time to leave the house
      }

      this._moveGhost(ghost, delta);
    }
  },

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
  },

  // ---------------------------------------------------------------------------
  // _chooseNextGhostDir – dispatcher that returns the next direction for a
  //   ghost at its current tile.
  //   Exiting ghosts are routed through _exitingDir; all others use
  //   _chooseDirToward with the mode-appropriate target tile.
  // ---------------------------------------------------------------------------
  _chooseNextGhostDir(ghost) {
    if (ghost.state === 'exiting')   return this._exitingDir(ghost);
    if (ghost.state === 'frightened') return this._chooseFrightenedDir(ghost);
    if (ghost.state === 'returning') return this._returningDir(ghost);
    const target = this._getGhostTarget(ghost);
    return this._chooseDirToward(ghost, target.row, target.col);
  },

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
  },

  // ---------------------------------------------------------------------------
  // _returningDir – drives a ghost in 'returning' state (eyes only) back to
  //   the ghost house entrance.  On arrival, teleports instantly to start
  //   position and resets to game-start state (Blinky → scatter, others →
  //   waiting).  No descent phase, no forcedWaiting timer.
  //
  //   @param  {object} ghost  Ghost state object
  //   @return {object|null}   { dx, dy } next direction, or null on arrival
  // ---------------------------------------------------------------------------
  _returningDir(ghost) {
    const { row, col } = ghost.tile;

    // Arrived at the ghost house entrance — teleport and respawn instantly
    if (row === GHOST_EXIT_ROW && col === GHOST_EXIT_COL) {
      const { x, y } = this._tileCenter(ghost.startRow, ghost.startCol);
      ghost.sprite.setPosition(x, y);
      ghost.tile          = { row: ghost.startRow, col: ghost.startCol };
      ghost.dir           = { dx: 0, dy: 0 };
      ghost.speed         = ghost.baseSpeed;
      ghost.forcedWaiting = false;
      // Exactly matches game-start state: Blinky exits immediately, others wait
      ghost.state         = ghost.exitDelay === 0 ? 'scatter' : 'waiting';
      return null;
    }

    // Still in the open maze — navigate toward the entrance
    return this._chooseDirToward(ghost, GHOST_EXIT_ROW, GHOST_EXIT_COL);
  },

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
  },

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
  },

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
    // 'exiting' ghosts leave the house; 'returning' ghosts re-enter it
    if (tile === TILE.GHOST_HOUSE) return ghost.state === 'exiting' || ghost.state === 'returning';
    return true;
  },

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
      if (ghost.state === 'returning') {
        // Eyes-only sprite while the ghost races back to the house
        ghost.sprite.setTexture('ghost_eyes');
        continue;
      }

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
  },

});
