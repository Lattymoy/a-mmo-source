import { W, H } from '../core/config.js';
import { idx, inB, DIRS4 } from '../core/grid.js';
import { rand } from '../core/rng.js';
import { S } from '../core/state.js';

export const isWall = (x, y) => !inB(x, y) || S.wall[idx(x, y)] === 1;

/* Cellular-automata cave, then cull everything but the largest open region so
   no tile is generated that the player cannot reach. */
export function genMap(){
  let wall = new Uint8Array(W * H);
  for(let i = 0; i < W * H; i++) wall[i] = rand() < 0.45 ? 1 : 0;
  for(let x = 0; x < W; x++){ wall[idx(x,0)] = 1; wall[idx(x,H-1)] = 1 }
  for(let y = 0; y < H; y++){ wall[idx(0,y)] = 1; wall[idx(W-1,y)] = 1 }

  for(let pass = 0; pass < 5; pass++){
    const nx = wall.slice();
    for(let y = 1; y < H-1; y++) for(let x = 1; x < W-1; x++){
      let n = 0;
      for(let dy = -1; dy <= 1; dy++) for(let dx = -1; dx <= 1; dx++)
        if(dx || dy) n += wall[idx(x+dx, y+dy)];
      nx[idx(x,y)] = n >= 5 ? 1 : (n <= 2 ? 0 : wall[idx(x,y)]);
    }
    wall = nx;
  }

  const reg = new Int32Array(W * H).fill(-1);
  let best = -1, bestN = 0, id = 0;
  for(let y = 0; y < H; y++) for(let x = 0; x < W; x++){
    if(wall[idx(x,y)] || reg[idx(x,y)] >= 0) continue;
    const q = [[x,y]]; reg[idx(x,y)] = id; let n = 0;
    while(q.length){
      const [cx,cy] = q.pop(); n++;
      for(const [dx,dy] of DIRS4){
        const a = cx+dx, b = cy+dy;
        if(inB(a,b) && !wall[idx(a,b)] && reg[idx(a,b)] < 0){ reg[idx(a,b)] = id; q.push([a,b]) }
      }
    }
    if(n > bestN){ bestN = n; best = id }
    id++;
  }
  for(let i = 0; i < W * H; i++) if(!wall[i] && reg[i] !== best) wall[i] = 1;

  S.wall = wall;
  S.seen = new Uint8Array(W * H);
  S.vis  = new Uint8Array(W * H);
  computeWallGeometry();
  return bestN;
}

/* Walls are geometry, not texture. A wall tile touching open floor is a FACE —
   the surface you can see. Faces connect to neighbouring faces, so a chamber's
   contour draws itself with real corners, tees and ends. Wall tiles with no
   floor around them are buried rock and render recessive.

   Faces get STROKED, not lettered — box-drawing glyphs only tile in a terminal
   where the cell is ~0.6 as wide as it is tall. On a square grid they never
   meet. See docs/bible/02-Systems/Visual Treatments.md.

   Mask bits: 1=N 2=E 4=S 8=W. */
export function computeWallGeometry(){
  const face = new Uint8Array(W * H);
  for(let y = 0; y < H; y++) for(let x = 0; x < W; x++){
    if(!S.wall[idx(x,y)]) continue;
    let touchesFloor = false;
    for(let dy = -1; dy <= 1 && !touchesFloor; dy++) for(let dx = -1; dx <= 1; dx++){
      if(!dx && !dy) continue;
      const a = x+dx, b = y+dy;
      if(inB(a,b) && !S.wall[idx(a,b)]){ touchesFloor = true; break }
    }
    if(touchesFloor) face[idx(x,y)] = 1;
  }
  const wface = new Uint8Array(W * H);
  for(let y = 0; y < H; y++) for(let x = 0; x < W; x++){
    if(!face[idx(x,y)]) continue;
    let m = 0;
    if(inB(x,y-1) && face[idx(x,y-1)]) m |= 1;
    if(inB(x+1,y) && face[idx(x+1,y)]) m |= 2;
    if(inB(x,y+1) && face[idx(x,y+1)]) m |= 4;
    if(inB(x-1,y) && face[idx(x-1,y)]) m |= 8;
    wface[idx(x,y)] = 1 + m;
  }
  S.wface = wface;
}

export function openTiles(){
  const o = [];
  for(let y = 0; y < H; y++) for(let x = 0; x < W; x++)
    if(!S.wall[idx(x,y)]) o.push([x,y]);
  return o;
}
