// =============================================================================
// GAME SCENE — shell only; helper methods arrive via mixins in the files below
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

    // Ghost eyes texture — just the two eyes on a black background; no body.
    // Displayed when a ghost is in 'returning' state (racing back to the house).
    // Eye geometry mirrors _drawGhostTexture exactly so the eyes sit in the same
    // positions relative to the sprite bounds.
    const ge     = this.textures.createCanvas('ghost_eyes', size, size);
    const gectx  = ge.getContext();
    const ecx    = size / 2;
    const edomeR = size / 2 - 1;
    const edomeY = edomeR;
    const eeyeY  = Math.round(edomeY * 0.65);
    const eeyeOX = size * 0.2;
    const eeyeR  = size * 0.13;
    const epupR  = eeyeR * 0.55;

    // Left eye
    gectx.fillStyle = '#ffffff';
    gectx.beginPath();
    gectx.arc(ecx - eeyeOX, eeyeY, eeyeR, 0, Math.PI * 2);
    gectx.fill();
    gectx.fillStyle = '#000033';
    gectx.beginPath();
    gectx.arc(ecx - eeyeOX + 1, eeyeY + 1, epupR, 0, Math.PI * 2);
    gectx.fill();

    // Right eye
    gectx.fillStyle = '#ffffff';
    gectx.beginPath();
    gectx.arc(ecx + eeyeOX, eeyeY, eeyeR, 0, Math.PI * 2);
    gectx.fill();
    gectx.fillStyle = '#000033';
    gectx.beginPath();
    gectx.arc(ecx + eeyeOX + 1, eeyeY + 1, epupR, 0, Math.PI * 2);
    gectx.fill();
    ge.refresh();
  }

  // ---------------------------------------------------------------------------
  // create – called once when the scene starts; draws the static maze
  // ---------------------------------------------------------------------------
  create() {
    // Reset the mutable tilemap from the immutable source so every new game
    // (including Play Again restarts) begins with a full set of dots/pellets.
    TILEMAP = ORIGINAL_TILEMAP.map(row => [...row]);

    // ---------------------------------------------------------------------------
    // Adjust power pellet count — reads gameConfig.pellets and either:
    //   • Downgrades excess TILE.PELLET → TILE.DOT  (wanted < existing)
    //   • Upgrades TILE.DOT → TILE.PELLET            (wanted > existing)
    //
    // For upgrades, candidates are scored by minimum tile-distance to any
    // existing pellet: tiles ≥ 5 away are preferred to spread extras around
    // the maze.  If not enough spaced candidates exist, any dot will do.
    // The maximum is capped at available dot tiles — can't exceed maze supply.
    // ORIGINAL_TILEMAP is never touched; only the fresh TILEMAP copy is
    // mutated here, before the rendering loop runs.
    // ---------------------------------------------------------------------------
    {
      const pelletCfg     = this.registry.get('gameConfig');
      const wantedPellets = pelletCfg ? (pelletCfg.pellets ?? 4) : 4;

      // Collect current pellet positions
      const pelletPositions = [];
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (TILEMAP[r][c] === TILE.PELLET) pelletPositions.push([r, c]);
        }
      }

      if (wantedPellets < pelletPositions.length) {
        // Downgrade excess pellets to dots (from end of list = deterministic)
        for (let i = wantedPellets; i < pelletPositions.length; i++) {
          const [r, c] = pelletPositions[i];
          TILEMAP[r][c] = TILE.DOT;
        }

      } else if (wantedPellets > pelletPositions.length) {
        // Upgrade dot tiles to pellets using greedy farthest-insertion:
        // pick the dot that is furthest from ALL confirmed pellets, promote it,
        // then re-score remaining candidates against the updated pellet set.
        // This guarantees each new pellet is maximally spaced from all others.

        // confirmed starts as a copy so we can extend it without mutating
        // pelletPositions (which the downgrade branch still references above).
        const confirmed = pelletPositions.slice();

        // Build candidate list — [row, col] for every current dot tile
        const dotCandidates = [];
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            if (TILEMAP[r][c] === TILE.DOT) dotCandidates.push([r, c]);
          }
        }

        // Helper: Chebyshev distance from (r,c) to its nearest confirmed pellet
        const minDistTo = (r, c) => {
          let best = Infinity;
          for (const [pr, pc] of confirmed) {
            const d = Math.max(Math.abs(r - pr), Math.abs(c - pc));
            if (d < best) best = d;
          }
          return best;
        };

        const needed = Math.min(wantedPellets - pelletPositions.length, dotCandidates.length);
        for (let i = 0; i < needed; i++) {
          // Find the candidate with the greatest minimum distance to confirmed pellets
          let bestIdx = 0;
          let bestDist = -1;
          for (let j = 0; j < dotCandidates.length; j++) {
            const [r, c] = dotCandidates[j];
            const d = minDistTo(r, c);
            if (d > bestDist) { bestDist = d; bestIdx = j; }
          }

          // Promote the winner and add to confirmed set
          const [r, c] = dotCandidates[bestIdx];
          TILEMAP[r][c] = TILE.PELLET;
          confirmed.push([r, c]);

          // Remove winner from candidates (swap-with-last for O(1) removal)
          dotCandidates[bestIdx] = dotCandidates[dotCandidates.length - 1];
          dotCandidates.pop();
        }
      }
    }

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
}
