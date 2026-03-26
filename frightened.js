// =============================================================================
// FRIGHTENED MIXIN — power pellet activation, ghost eating, and random AI
// =============================================================================

Object.assign(GameScene.prototype, {

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
  },

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
  },

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

    // Leave the sprite where it is — only the eyes remain, racing home.
    // Speed is boosted to 1.5× base so the eyes visibly sprint back.
    ghost.state = 'returning';
    ghost.speed = ghost.baseSpeed * 1.5;
    // dir is kept so _moveGhost has a valid heading to continue from this frame
  },

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
  },

});
