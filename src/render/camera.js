import { COLS } from '../core/config.js';
import { S } from '../core/state.js';
import { unproject } from './rounded.js';

/* Tile size is derived from column count, and column count from camera mode.
   `close` is the thumb-legible budget; `tactical` is wider and takes no input.
   Mobile enlarges further for bosses — stated, not yet built. */
// px/py: the player's cell, the fold's centre. The renderer writes them
// each frame beside ox/oy — the fold is measured from the player, so the
// inverse needs the same origin the forward pass used.
export const view = { TS: 24, cols: 11, rows: 14, ox: 0, oy: 0, dpr: 1, px: 0, py: 0 };

let cv = null, ctx = null;

export function bindCanvas(canvas){
  cv = canvas;
  ctx = canvas.getContext('2d');
  return ctx;
}
export const canvas = () => cv;
export const context = () => ctx;

export function resize(){
  if(!cv) return;
  view.dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
  const r = cv.parentElement.getBoundingClientRect();
  cv.width  = r.width  * view.dpr;
  cv.height = r.height * view.dpr;
  cv.style.width  = r.width + 'px';
  cv.style.height = r.height + 'px';
  view.cols = COLS[S.cam];
  view.TS   = Math.floor(r.width / view.cols);
  view.rows = Math.floor(r.height / view.TS);
}

/* Screen point -> tile. The inverse of the draw offset, kept here so input and
   rendering can never disagree about where a tile is. */
export function tileAt(clientX, clientY){
  const r = cv.getBoundingClientRect();
  // THROUGH THE SAME PAIR THE RENDERER DRAWS WITH. The comment above is a
  // promise — "input and rendering can never disagree about where a tile
  // is" — and the fold is exactly the thing that could break it: a curled
  // grid puts a tile somewhere the flat inverse would not look. unproject()
  // is project()'s closed-form inverse and a test drives one through the
  // other on every visible cell, so the promise is checked rather than
  // remembered.
  //
  // null means the tap was past the horizon: sky, not ground. Callers must
  // treat that as "no tile" rather than clamping, because inventing one is
  // how the two start to disagree again.
  return unproject(
    clientX - r.left, clientY - r.top,
    view.px + 0.5, view.py + 0.5,
    view.TS, view.ox, view.oy,
  );
}
