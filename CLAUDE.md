# Pac-Man — Project Rules & Reference

## Project Overview
Configurable Pac-Man clone built in Phaser 3. The player can tune speed, scale, lives, and invincibility via an HTML config panel before each game. Development proceeds in milestones; each milestone layers on top of the last without replacing prior systems.

---

## Tech Stack — DO NOT CHANGE
- Phaser 3 via CDN
- Vanilla HTML + JS + CSS — exactly 3 files (`index.html`, `style.css`, `app.js`)
- No npm, no bundlers, no TypeScript, no external assets

---

## Core Architecture Rules — STRICT
- All game logic lives in `app.js`
- Scene structure: `GameScene` → `GameOverScene` → back to config panel
- Config is passed through `this.registry.get('gameConfig')` — a plain object set before `scene.start`
- Maze data lives in `ORIGINAL_TILEMAP` (immutable) and `TILEMAP` (mutable deep copy per game)
- Tile types: `0=WALL`, `1=DOT`, `2=PELLET`, `3=EMPTY`, `4=GHOST_HOUSE`
- Wall collision uses tilemap array lookups — NOT Phaser physics static bodies

---

## Rendering System
Three-layer maze draw in `create()`:
1. **Layer 1** — blue (`0x1919a6`) 20×20 wall tiles
2. **Layer 2** — black 35×35 path squares carved over every non-wall tile (creates wider visual corridors)
3. **Layer 3** — dots and pellets as individual `this.add.circle` objects stored in `this.dotSprites` (Map keyed `"row,col"`); ghost house overlay in purple

Dots/pellets are individual game objects so they can be destroyed on eat. The tile grid is 20 px; the visual path carve is 35 px — do not conflate these.

---

## Movement System
- Pac-Man and ghosts move tile-to-tile, not freely through physics
- Pac-Man uses a queued-direction (pre-turn / cornering) system: the last pressed key is buffered as `queuedDir` and tried first on snap
- Ghost direction is chosen once per tile arrival via `_chooseNextGhostDir`
- No recursive movement or pathfinding — all direction decisions are single-pass iterative loops
- Horizontal tunnel wrap is handled at both the pixel and tile level

---

## Ghost System

### States
| State | Behavior |
|---|---|
| `waiting` | Stationary inside ghost house; waits for `exitDelay` |
| `exiting` | Navigates to exit column then exit row; joins global mode on arrival |
| `scatter` | Targets its fixed corner tile |
| `chase` | Targets Pac-Man's current tile |
| `frightened` | Random valid direction at each intersection; half speed |

### Mode Cycle
- Global `this.ghostMode` alternates scatter → chase on a timer (`SCATTER_DURATION` / `CHASE_DURATION`)
- `_updateGhostMode` propagates mode changes only to ghosts in `scatter` or `chase` — never overwrites `frightened`, `exiting`, or `waiting`
- Frightened mode is a **temporary override**: when it ends, ghosts rejoin whichever mode (`this.ghostMode`) the underlying timer is currently in

### Frightened Mode
- Triggered by eating a power pellet (`TILE.PELLET`)
- Duration: `FRIGHTENED_DURATION` (7 000 ms); re-eating a pellet cancels and restarts the timer
- Ghosts flash blue ↔ white during the final `FRIGHTENED_FLASH_START` (2 000 ms)
- Eating a frightened ghost: 200 × `ghostEatMultiplier` points; multiplier doubles per ghost eaten; ghost teleports to house as `exiting`
- `_endFrightened()` is safe to call at any time (no-op if inactive); called by `resetPositions()` on death/respawn

### Ghost Reset
- On death/respawn all ghosts teleport to `startRow`/`startCol`
- Blinky (`exitDelay === 0`) resets to `scatter`; all others reset to `waiting`
- `gameStartTime` and `modeStartTime` restart from `now`

---

## Game State & Flow
```
Config panel (HTML)
  → GameScene.create()   — deep-copies TILEMAP, spawns sprites, starts scatter
  → GameScene.update()   — movement → eat → visuals → mode → ghosts → collision
  → handlePlayerDeath()  — freeze → decrement lives → respawn or GameOverScene
  → GameOverScene        — score display + Play Again button
  → destroy Phaser       — restore config panel HTML
```

A full game reset must restore:
- `TILEMAP` from `ORIGINAL_TILEMAP`
- Pac-Man position, velocity, direction state
- All ghost positions, directions, states, and speeds
- Score, lives, `ghostMode`, `isFrightened`, all timers

---

## Coding Constraints — DO NOT VIOLATE
- No manual `canvas.getContext` drawing at runtime (only in `preload()` for texture baking)
- No custom `requestAnimationFrame` loop — use Phaser's `update(time, delta)`
- No recursive functions anywhere
- Comment every new method with purpose, parameters, and any non-obvious behaviour
- New textures are baked in `preload()` via `this.textures.createCanvas`

---

## Known Patterns
- `ORIGINAL_TILEMAP` → deep copy → `TILEMAP` at game start (never mutate the original)
- Tile-based collision: `TILEMAP[row][col] === TILE.WALL`, not Phaser overlap callbacks
- State flags: `this.dying` (update loop freeze), `this.isFrightened` (frightened mode active)
- Per-ghost `baseSpeed` stored at creation; `ghost.speed` is mutated during frightened mode and restored on end
- `dotSprites` Map stores live circle objects; destroy + delete on eat, never re-create mid-game

---

## Guidance for Future Milestones
- New features layer **on top of** existing systems — do not replace working code
- Ghost AI changes belong in `_chooseNextGhostDir` and its helpers; avoid scattering ghost logic elsewhere
- New ghost states follow the existing pattern: add a branch in `_chooseNextGhostDir`, guard `_updateGhostMode` propagation, handle in `_checkGhostCollision`, and clean up in `resetPositions` / `_endFrightened`
- Score additions: update `scoreText` immediately after mutating `this.score`
- Keep frightened logic modular for planned additions: score multiplier chain, "eyes returning to base" state
