// =============================================================================
// GAMEPLAY MIXIN — dot eating, collision, death, reset, win, and tile drawing
// =============================================================================

Object.assign(GameScene.prototype, {

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
  },

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
  },

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
  },

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
  },

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
      ghost.tile          = { row: ghost.startRow, col: ghost.startCol };
      ghost.dir           = { dx: 0, dy: 0 };
      ghost.state         = ghost.exitDelay === 0 ? 'scatter' : 'waiting';
      ghost.speed         = ghost.baseSpeed;   // restore from returning (1.5×) or frightened (0.5×)
      ghost.forcedWaiting = false;             // clear any pending return-pause
    }

    // Cancel any active frightened mode — a death/respawn ends it immediately
    this._endFrightened();

    // Restart the scatter/chase cycle and ghost exit timers from now
    const now          = this.time.now;
    this.gameStartTime = now;
    this.modeStartTime = now;
    this.ghostMode     = 'scatter';

    this.dying = false;  // re-enable the update loop
  },

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
  },

});
