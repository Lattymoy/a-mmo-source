import { COLS } from '../core/config.js';
import { S } from '../core/state.js';

/* Tile size is derived from column count, and column count from camera mode.
   `close` is the thumb-legible budget; `tactical` is wider and takes no input.
   Mobile enlarges further for bosses — stated, not yet built. */
export const view = { TS: 24, cols: 11, rows: 14, ox: 0, oy: 0, dpr: 1 };

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
  return [
    Math.floor((clientX - r.left + view.ox) / view.TS),
    Math.floor((clientY - r.top  + view.oy) / view.TS),
  ];
}
