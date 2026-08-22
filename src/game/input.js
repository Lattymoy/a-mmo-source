import { idx, inB, dist } from '../core/grid.js';
import { S } from '../core/state.js';
import { isWall } from '../world/mapgen.js';
import { pathTo } from '../world/path.js';
import { entAt } from './entities.js';
import { validSet, onCooldown } from './abilities.js';

export function disarm(){ S.armed = null; S.valid = null }

export function arm(id){
  if(S.dead) return;
  if(S.armed === id){ disarm(); return }
  if(onCooldown(id)) return;
  S.armed = id;
  S.valid = validSet(id);
}

/* One verb. What it means is set by context and by what is armed.
   The rule that makes it safe on a touchscreen: a tap outside the lit set
   DISARMS, it never misfires. See docs/bible/02-Systems/Tap Input.md. */
export function tapTile(x, y){
  if(S.dead || !inB(x, y)) return;
  const p = S.player;

  if(S.armed){
    if(S.valid.has(idx(x,y))){
      S.queued = { type: 'ability', id: S.armed, x, y };
      S.path = [];
      disarm();
      S.waiting = false;
    } else {
      disarm();
    }
    return;
  }

  const e = entAt(x, y);

  if(e && !e.you && dist(x, y, p.x, p.y) <= 1){
    S.queued = { type: 'attack', x, y };
    S.path = [];
    S.waiting = false;
    return;
  }

  if(e && !e.you){          // out of reach: walk adjacent, the next tap swings
    let best = null, bd = Infinity;
    for(let dy = -1; dy <= 1; dy++) for(let dx = -1; dx <= 1; dx++){
      const a = x + dx, b = y + dy;
      if(isWall(a,b) || entAt(a,b)) continue;
      const route = pathTo(a, b);
      if(route.length && route.length < bd){ bd = route.length; best = route }
    }
    if(best){ S.path = best; S.waiting = false }
    return;
  }

  const route = pathTo(x, y);     // any new tap replaces the old one
  if(route.length){ S.path = route; S.waiting = false }
}
