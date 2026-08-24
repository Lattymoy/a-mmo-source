/* EFFIGY BAKE — a living pixel figure, frozen to a grid sprite.
 *
 * a-mmo's law, from author.mjs and not negotiable here:
 *
 *   "ONE pixel size for the entire game. A sprite's size in the world is a
 *    consequence of how many pixels it is drawn with — never of a scale
 *    factor."
 *
 * Which decides where Effigy goes. Effigy is a runtime engine: skeleton,
 * IK, pose interpolation, ~10,000 lines solving a figure every frame. On a
 * grid with a screenful of monsters that is the wrong shape, and vendoring
 * it would put 16,000 lines into a repo whose whole premise is a step back
 * from complexity.
 *
 * So it bakes. Effigy runs HERE, offline, and the game gets pixels — the
 * same split a-mmo already uses for gear (author.mjs -> gear-sprites.js,
 * with a test asserting the two are in sync) and the same one Fight Life
 * uses for its enemy billboards.
 *
 * WHY THE HUSK. luminance is Raum's own pack — a drained figure from
 * project-raum, which a-mmo shares a universe with. It is also the
 * smallest pack that owns its figure outright (1,274 lines against
 * medieval's 10,346), so it is the honest first test of whether a
 * procedural figure beats a letter on this grid.
 *
 * Run: node tools/effigy-bake.mjs <path-to-effigy-checkout>
 */

import { writeFileSync, mkdirSync } from 'node:fs';
// The repo's own encoder, not a dependency. a-mmo ships with an empty
// lockfile beyond vite and that is worth keeping — a bake tool is not a
// reason to add pngjs.
import { encodePNG } from './sprites/png.mjs';

const EFFIGY = process.argv[2] || '../effigy';

const { installLuminance, makeLuminanceCl } = await import(`${EFFIGY}/packs/luminance/pack.js`);
const { composeFigure } = await import(`${EFFIGY}/src/composeFigure.js`);

installLuminance();

/* EFFIGY'S OWN ADAPTER, ON A REAL CONTEXT.
 *
 * The first cut here hand-rolled a buffer that answered fillStyle and
 * fillRect, on the assumption those were the whole contract. They are not:
 * the engine also calls fillEllipse, lineBetween, clipRect, renderRotated
 * and a full save/restore/translate/rotate/scale stack. Reimplementing
 * that would be inventing a second renderer to sit beside the one Effigy
 * already ships — makeCanvasGfx — and every hour I have lost to this
 * engine has been spent doing exactly that.
 *
 * So: a real 2D context, and the engine's own adapter over it. The context
 * comes from @napi-rs/canvas, which is not a-mmo's dependency and must not
 * become one — the bake is a BUILD tool and resolves it from wherever it
 * is installed. */
const CANVAS_PKG = process.argv[3] || '/home/claude/fight-life/node_modules/@napi-rs/canvas/index.js';
const { createCanvas } = await import(CANVAS_PKG);
const { makeCanvasGfx } = await import(`${EFFIGY}/src/core/gfxAdapter.js`);

/* THE FOUR FACINGS. Effigy is 4-directional and a grid has four cardinal
 * moves, which is not a coincidence to engineer around — it is the same
 * number. `side` is baked once and mirrored for the fourth. */
const VIEWS = [
  ['front', 'front', 1],
  ['side-r', 'side', 1],
  ['back', 'back', 1],
  ['side-l', 'side', -1],
];

/* Cell size drives figure size, per the law: the sprite is drawn at the
 * pixels it occupies, and the world size follows from that. */
const CELL = 24;

/* MEASURED, NOT ASSUMED. My first two passes guessed the figure's height
 * from Effigy's unit scale and clipped the skull twice — the Husk's
 * crystal growth rises above the head, so the drawn figure is 55 units
 * tall at s = 1, not the ~34 the rig nominally stands. Measured by baking
 * into an oversized frame and reading the bounds, which is the only way
 * to know: no constant in the engine states it.
 *
 * A figure stands about 1.6 tiles tall, so the unit scale falls out of
 * that and the frame follows the figure rather than the other way round —
 * a-mmo's law is that world size is a consequence of pixel count, never
 * of a scale factor. */
const FIG_UNITS = 55;                                 // measured, at s = 1
const FIG_H = Math.round(CELL * 1.6);                 // the figure's target height
const S = Math.max(1, Math.round(FIG_H / FIG_UNITS)); // unit scale
const H = FIG_UNITS * S + S * 3;                      // + slack for the shadow below
const W = CELL * 2;
const FEET = H - S * 3;                               // where the figure's feet sit in the cell

const cells = [];
for (const [name, view, fc] of VIEWS) {
  const cv = createCanvas(W, H);
  const ctx = cv.getContext('2d');
  composeFigure(makeCanvasGfx(ctx), {
    px: W / 2,
    py: FEET,
    s: S,
    fc,
    st: 'idleRelax',
    ratio: 0,
    view,
    cl: makeLuminanceCl(1),
  });
  const px = ctx.getImageData(0, 0, W, H).data;
  let lit = 0;
  for (let i = 3; i < px.length; i += 4) if (px[i] > 8) lit++;
  console.log(`  ${name.padEnd(7)} ${lit} lit pixels`);
  cells.push(px);
}

// One strip, four facings, left to right.
const SW = W * cells.length;
const rgba = new Uint8Array(SW * H * 4);
for (let c = 0; c < cells.length; c++) {
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const s = (y * W + x) * 4;
      const d = (y * SW + c * W + x) * 4;
      rgba[d] = cells[c][s];
      rgba[d + 1] = cells[c][s + 1];
      rgba[d + 2] = cells[c][s + 2];
      rgba[d + 3] = cells[c][s + 3];
    }
  }
}
mkdirSync('public/sprites', { recursive: true });
writeFileSync('public/sprites/husk.png', encodePNG(SW, H, rgba));
console.log(`husk.png  ${W * cells.length}x${H}  (${cells.length} facings, cell ${W}x${H})`);
