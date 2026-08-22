import { dist } from '../core/grid.js';
import { ri, rand } from '../core/rng.js';
import { S } from '../core/state.js';
import { isWall } from '../world/mapgen.js';
import { los } from '../world/fov.js';
import { KINDS } from './kinds.js';
import { entAt, stepTo, damage } from './entities.js';
import { atkOf, defOf } from './stats.js';
import { abilityById } from './abilities.js';
import { lungeAt, slashAt, swing } from './fx.js';
import { say } from '../ui/log.js';

function meleeSwing(attacker, target){
  lungeAt(attacker, target.x, target.y, false);
  slashAt(attacker.x, attacker.y, target.x, target.y);
  swing(attacker);
}

/* Returns the action's cost in ticks, or 0 if the player still needs input.
   Returning 0 is what holds the clock — see scheduler. */
export function playerAct(){
  const p = S.player;

  if(S.queued){
    const q = S.queued;
    S.queued = null;

    if(q.type === 'attack'){
      const e = entAt(q.x, q.y);
      if(e && !e.you && dist(e.x, e.y, p.x, p.y) <= 1){
        meleeSwing(p, e);
        damage(e, atkOf(p) + ri(3));
        say(`hit ${KINDS[e.kind].name}`);
        return 120;
      }
      return 0;
    }

    if(q.type === 'ability'){
      const A = abilityById(q.id);
      if(A.fire(q.x, q.y)){ S.cooldown[A.id] = S.clock + A.cd; return A.cost }
      return 0;
    }
  }

  if(S.path.length){
    const [x,y] = S.path[0];
    const e = entAt(x, y);
    if(e && !e.you){            // something walked into the route: swing instead
      S.path = [];
      meleeSwing(p, e);
      damage(e, atkOf(p) + ri(3));
      say(`hit ${KINDS[e.kind].name}`);
      return 120;
    }
    S.path.shift();
    stepTo(p, x, y);
    return 100;
  }

  return 0;
}

export function monsterAct(m){
  const K = KINDS[m.kind], p = S.player;
  const d = dist(m.x, m.y, p.x, p.y);
  const sees = d <= K.sight && los(m.x, m.y, p.x, p.y);

  if(sees && d <= 1){
    meleeSwing(m, p);
    const raw = K.dmg[0] + ri(K.dmg[1] - K.dmg[0] + 1);
    const dealt = Math.max(1, raw - defOf(p));
    damage(p, dealt);
    say(`${K.name} hits you${dealt < raw ? ' \u2014 blocked ' + (raw - dealt) : ''}`);
    return K.spd;
  }

  if(sees){
    let bx = 0, by = 0, bd = d;
    for(let dy = -1; dy <= 1; dy++) for(let dx = -1; dx <= 1; dx++){
      if(!dx && !dy) continue;
      const x = m.x + dx, y = m.y + dy;
      if(isWall(x,y) || entAt(x,y)) continue;
      const nd = dist(x, y, p.x, p.y);
      if(nd < bd){ bd = nd; bx = dx; by = dy }
    }
    if(bx || by) stepTo(m, m.x + bx, m.y + by);
    return K.spd;
  }

  if(rand() < 0.35){
    const [dx,dy] = [[1,0],[-1,0],[0,1],[0,-1]][ri(4)];
    const x = m.x + dx, y = m.y + dy;
    if(!isWall(x,y) && !entAt(x,y)) stepTo(m, x, y);
  }
  return K.spd;
}
