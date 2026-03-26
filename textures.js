// =============================================================================
// TEXTURES MIXIN — _drawGhostTexture canvas baking logic
// =============================================================================

Object.assign(GameScene.prototype, {

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
  },

});
