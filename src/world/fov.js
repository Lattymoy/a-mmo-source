import { FOV } from '../core/config.js';
import { idx, inB, dist } from '../core/grid.js';
import { S } from '../core/state.js';
import { isWall } from './mapgen.js';

/* Bresenham line of sight. Used for both vision and monster awareness, so what
   can see you is exactly what you could see back. */
export function los(x0, y0, x1, y1){
  const dx = Math.abs(x1-x0), dy = Math.abs(y1-y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy, x = x0, y = y0;
  while(x !== x1 || y !== y1){
    const e2 = 2 * err;
    if(e2 > -dy){ err -= dy; x += sx }
    if(e2 <  dx){ err += dx; y += sy }
    if(x === x1 && y === y1) return true;
    if(isWall(x, y)) return false;
  }
  return true;
}

export function computeFOV(){
  const p = S.player;
  S.vis.fill(0);
  for(let y = p.y - FOV; y <= p.y + FOV; y++)
    for(let x = p.x - FOV; x <= p.x + FOV; x++){
      if(!inB(x,y) || dist(x,y,p.x,p.y) > FOV) continue;
      if(los(p.x, p.y, x, y)){ S.vis[idx(x,y)] = 1; S.seen[idx(x,y)] = 1 }
    }
}
