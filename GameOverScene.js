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
