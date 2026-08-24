/* ── THE ROUNDED WORLD ──────────────────────────────────────────────────
   Raum's horizon fold, brought to the grid.

   THE FOLD, verbatim from project-raum (src/main.js:48, Mac-tuned) and
   already vendored once into Fight Life's hub engine, whose comment reads:

     "After yaw and BEFORE pitch, everything past the start line curls
      under the horizon quadratically. This is the rounded world."
     FOLD = { coef: 0.006, start: 0 }

   There it is applied in world space to a 3D scene, to world, shadows and
   billboards alike. Here the world is a flat integer grid seen from above,
   and the translation is the point of this file.

   ── WHY RADIAL AND NOT A HORIZON ─────────────────────────────────────

   A horizon fold has a direction: things get further AWAY along one axis
   and curl under. A top-down grid centred on the player has no such axis —
   every direction is equally away. So the honest translation is RADIAL:
   the ground falls away in every direction at once, and the player stands
   on a small planet rather than on a plane that happens to bend one way.

   That also keeps the fold true to what it is for. The horizon fold's job
   in Raum is to answer "how far do I draw" without a hard edge or a wall
   of fog. Radially it answers the same question in every direction: the
   map curves out of sight instead of stopping.

   ── ONE MAPPING, TWO DIRECTIONS ──────────────────────────────────────

   camera.js says it already, and it is the reason this file exists rather
   than a fold sprinkled through draw.js:

     "Screen point -> tile. The inverse of the draw offset, kept here so
      input and rendering can never disagree about where a tile is."

   Today `x * TS - ox` is written out in six places in draw.js while its
   inverse lives alone in camera.js — two implementations of one contract,
   which is exactly how they drift. project() and unproject() below are the
   single pair, and a test drives one through the other on every cell of a
   view to prove they still agree. Add the fold to one and forget the
   other and that test goes red, which is the whole point of writing them
   as a pair before the fold ever lands.

   ── THE INVERSE IS EXACT, NOT ITERATIVE ──────────────────────────────

   The shrink is a function of RADIUS only, so both directions solve in
   closed form:

     forward   s = r / (1 + k*r^2)            r = cells from the player
     inverse   r = (1 - sqrt(1 - 4*k*s^2)) / (2*k*s)

   The inverse is the smaller root — the near branch. The far root is the
   fold's own reflection: past the fold's horizon two different radii land
   on the same screen distance, and the near one is the tile you can see.
   Beyond the turning point (s > 1/(2*sqrt(k))) nothing is visible at all,
   and unproject says so rather than guessing.
*/

/** The fold's strength, in the same shape as Raum's `coef`.
 *  0 is a flat grid and every existing behaviour is unchanged. */
export const FOLD = { coef: 0 };

/** The screen distance past which the fold has turned over and no tile
 *  projects. Beyond this a tap is on sky, not on ground. */
export const foldHorizon = () => (FOLD.coef > 0 ? 1 / (2 * Math.sqrt(FOLD.coef)) : Infinity);

/**
 * Cell -> screen, in pixels, relative to the canvas.
 *
 * `cx, cy` are the player's cell (the fold's centre — the ground is flat
 * under the player's feet and falls away from there).
 */
export function project(x, y, cx, cy, TS, ox, oy) {
  const px = x * TS - ox;
  const py = y * TS - oy;
  if (FOLD.coef <= 0) return [px, py];
  const ax = cx * TS - ox;
  const ay = cy * TS - oy;
  const dx = px - ax;
  const dy = py - ay;
  // Radius in CELLS, not pixels, so the fold reads identically at any tile
  // size — the same reason Raum's coef is in world units and not in screen
  // ones. A phone that enlarges TS for a boss must not flatten the world.
  const r = Math.hypot(dx, dy) / TS;
  if (r === 0) return [px, py];
  const s = r / (1 + FOLD.coef * r * r); // the curl
  const k = s / r;                        // shrink the offset, keep the bearing
  return [ax + dx * k, ay + dy * k];
}

/**
 * Screen -> cell. The exact inverse of project(), by construction.
 *
 * Returns null when the point is past the fold's horizon: beyond the
 * turning point no radius maps there, and inventing a tile for a tap on
 * the sky is how input and rendering start disagreeing.
 */
export function unproject(sx, sy, cx, cy, TS, ox, oy) {
  const ax = cx * TS - ox;
  const ay = cy * TS - oy;
  const dx = sx - ax;
  const dy = sy - ay;
  if (FOLD.coef <= 0) {
    return [Math.floor((sx + ox) / TS), Math.floor((sy + oy) / TS)];
  }
  const s = Math.hypot(dx, dy) / TS;
  // The centre cell: no offset to invert, but it must still FLOOR like
  // every other return or the one tile under the player comes back as a
  // float and compares unequal to itself. Caught by driving the pair
  // through each other rather than by reading them.
  if (s === 0) return [Math.floor((ax + ox) / TS), Math.floor((ay + oy) / TS)];
  const disc = 1 - 4 * FOLD.coef * s * s;
  if (disc < 0) return null; // past the horizon: sky, not ground
  // The NEAR root. Past the fold's turn two radii share a screen distance;
  // the near one is the tile the player can actually see.
  const r = (1 - Math.sqrt(disc)) / (2 * FOLD.coef * s);
  const k = r / s;
  const px = ax + dx * k;
  const py = ay + dy * k;
  return [Math.floor((px + ox) / TS), Math.floor((py + oy) / TS)];
}

/**
 * The local shrink at a cell — how much smaller a tile is drawn there.
 *
 * Moving centres is not enough on its own. The fold pulls neighbouring
 * centres closer together as they recede, so a tile drawn at full TS
 * would overlap its neighbour. The tile has to shrink by the same rate
 * the spacing does, which is the derivative of the curl:
 *
 *   s(r) = r / (1 + k*r^2)      ds/dr = (1 - k*r^2) / (1 + k*r^2)^2
 *
 * At r = 0 that is 1 (flat under the player's feet, tiles full size) and
 * it falls to 0 at the turning radius, which is the horizon closing.
 * Negative past it — the fold's far side — so it clamps at 0: a tile there
 * is not small, it is gone.
 */
export function foldScaleAt(x, y, cx, cy) {
  if (FOLD.coef <= 0) return 1;
  const r = Math.hypot(x - cx, y - cy);
  const d = 1 + FOLD.coef * r * r;
  return Math.max(0, (1 - FOLD.coef * r * r) / (d * d));
}

/** The turning radius in CELLS: past this the ground has curled away and
 *  nothing should be drawn or picked. The fold's own draw distance. */
export const foldRadius = () => (FOLD.coef > 0 ? 1 / Math.sqrt(FOLD.coef) : Infinity);

/**
 * A cell as its four PROJECTED corners, in draw order.
 *
 * Scaling a centred rect by the fold's derivative is only an approximation
 * of the spacing, and the error shows: at coef 0.012 visible GAPS open
 * between distant tiles, because the true gap between two projected
 * centres is not TS times the derivative at either of them.
 *
 * Projecting the corners has no such error by construction — adjacent
 * cells share corner coordinates exactly, so the ground is watertight at
 * any fold strength. Costs four projections a tile instead of one, on a
 * bounded visible set.
 */
export function cellQuad(x, y, cx, cy, TS, ox, oy, inset = 0) {
  const i = inset / TS;
  const a = project(x + i, y + i, cx, cy, TS, ox, oy);
  const b = project(x + 1 - i, y + i, cx, cy, TS, ox, oy);
  const c = project(x + 1 - i, y + 1 - i, cx, cy, TS, ox, oy);
  const d = project(x + i, y + 1 - i, cx, cy, TS, ox, oy);
  return [a, b, c, d];
}

/** Fill a cell's quad on a 2d context. */
export function fillCell(ctx, x, y, cx, cy, TS, ox, oy, inset = 0) {
  const [a, b, c, d] = cellQuad(x, y, cx, cy, TS, ox, oy, inset);
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.lineTo(c[0], c[1]);
  ctx.lineTo(d[0], d[1]);
  ctx.closePath();
  ctx.fill();
}
