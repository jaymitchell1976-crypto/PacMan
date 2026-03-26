// =============================================================================
// PAC-MAN MIXIN — movement, input, and visual helpers
// =============================================================================

Object.assign(GameScene.prototype, {

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
  },

  // ---------------------------------------------------------------------------
  // _canMoveTo – returns true if Pac-Man can enter the tile at (row, col).
  //   TILE.WALL blocks movement.
  //   Columns outside [0, COLS) are the horizontal tunnel — always passable.
  // ---------------------------------------------------------------------------
  _canMoveTo(row, col) {
    if (col < 0 || col >= COLS) return true;   // horizontal tunnel exits
    if (row < 0 || row >= ROWS) return false;
    return TILEMAP[row][col] !== TILE.WALL;
  },

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
  },

  // ---------------------------------------------------------------------------
  // _setupInput – creates the cursor-key set used in _handleMovement.
  // ---------------------------------------------------------------------------
  _setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
  },

  // ---------------------------------------------------------------------------
  // _applyVelocity – pushes pacDir × pacSpeed into the physics body.
  // ---------------------------------------------------------------------------
  _applyVelocity() {
    this.pac.setVelocity(
      this.pacDir.dx * this.pacSpeed,
      this.pacDir.dy * this.pacSpeed,
    );
  },

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
  },

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
  },

});
