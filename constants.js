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
