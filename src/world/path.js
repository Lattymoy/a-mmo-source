import { W, H } from '../core/config.js';
import { idx, inB } from '../core/grid.js';
import { S } from '../core/state.js';
import { isWall } from './mapgen.js';
import { entAt } from '../game/entities.js';

/* BFS from the player. Routes around bodies rather than through them, except
   for the goal tile itself — so tapping a monster still produces a route. */
export function pathTo(tx, ty){
  if(isWall(tx, ty)) return [];
  const p = S.player;
  const prev = new Int32Array(W * H).fill(-1);
  const start = idx(p.x, p.y), goal = idx(tx, ty);
  const q = [start];
  prev[start] = start;

  for(let h = 0; h < q.length; h++){
    const cur = q[h];
    if(cur === goal) break;
    const cx = cur % W, cy = (cur / W) | 0;
    for(let dy = -1; dy <= 1; dy++) for(let dx = -1; dx <= 1; dx++){
      if(!dx && !dy) continue;
      const a = cx+dx, b = cy+dy;
      if(!inB(a,b) || S.wall[idx(a,b)] || prev[idx(a,b)] >= 0) continue;
      if(entAt(a,b) && idx(a,b) !== goal) continue;
      prev[idx(a,b)] = cur;
      q.push(idx(a,b));
    }
  }
  if(prev[goal] < 0) return [];

  const out = [];
  let c = goal;
  while(c !== start){ out.unshift([c % W, (c / W) | 0]); c = prev[c] }
  return out;
}
