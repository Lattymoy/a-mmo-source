import { W, H } from './config.js';

export const idx  = (x, y) => y * W + x;
export const inB  = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
/* Chebyshev: diagonal steps cost the same as orthogonal, so range reads as a
   square. Matches how the tap grid actually behaves. */
export const dist = (ax, ay, bx, by) => Math.max(Math.abs(ax - bx), Math.abs(ay - by));

export const DIRS4 = [[1,0],[-1,0],[0,1],[0,-1]];
export const DIRS8 = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
