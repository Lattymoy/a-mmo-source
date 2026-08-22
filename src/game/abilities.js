import { idx, inB, dist } from '../core/grid.js';
import { ri } from '../core/rng.js';
import { S } from '../core/state.js';
import { isWall } from '../world/mapgen.js';
import { GROUND } from '../world/ground.js';
import { KINDS } from './kinds.js';
import { entAt, stepTo, damage } from './entities.js';
import { atkOf } from './stats.js';
import { lungeAt, slashAt, shotAt, swing } from './fx.js';
import { say } from '../ui/log.js';

/* Arming makes the next tap modal, so every ability must be able to SHOW its
   own legal set. `tiles()` is that contract — no ability may be added without
   one, or a tap outside it would misfire instead of disarming. */
export const ABIL = [
  {
    id: 'dash', g: '\u00bb', name: 'dash', cost: 60, cd: 280,
    tiles(){
      const p = S.player, t = [];
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        for(let n = 1; n <= 3; n++){
          const x = p.x + dx*n, y = p.y + dy*n;
          if(isWall(x,y) || entAt(x,y)) break;
          t.push([x,y]);
        }
      }
      return t;
    },
    fire(x, y){
      const p = S.player;
      const d = Math.max(Math.abs(x - p.x), Math.abs(y - p.y));
      stepTo(p, x, y);
      say(`dash ${d}`);
      return true;
    },
  },
  {
    id: 'cleave', g: '\u2733', name: 'cleave', cost: 150, cd: 420,
    tiles(){
      const p = S.player, t = [];
      for(let dy = -1; dy <= 1; dy++) for(let dx = -1; dx <= 1; dx++){
        if(!dx && !dy) continue;
        const x = p.x + dx, y = p.y + dy;
        if(inB(x,y) && !isWall(x,y)) t.push([x,y]);
      }
      return t;
    },
    fire(x, y){
      const p = S.player;
      const dx = Math.sign(x - p.x), dy = Math.sign(y - p.y);
      const arc = dx && dy ? [[dx,dy],[dx,0],[0,dy]]
                : dx      ? [[dx,-1],[dx,0],[dx,1]]
                          : [[-1,dy],[0,dy],[1,dy]];
      let hit = 0;
      lungeAt(p, x, y, false); swing(p);
      for(const [ax,ay] of arc){
        slashAt(p.x, p.y, p.x + ax, p.y + ay);
        const e = entAt(p.x + ax, p.y + ay);
        if(e && !e.you){ damage(e, atkOf(p) + ri(3)); hit++ }
      }
      say(hit ? `cleave \u2014 ${hit} hit` : 'cleave \u2014 nothing');
      return true;
    },
  },
  {
    id: 'hurl', g: '\u2197', name: 'hurl', cost: 100, cd: 240,
    tiles(){
      const p = S.player, t = [];
      for(let y = p.y - 5; y <= p.y + 5; y++) for(let x = p.x - 5; x <= p.x + 5; x++){
        if(!inB(x,y) || isWall(x,y)) continue;
        const d = dist(x, y, p.x, p.y);
        if(d > 5 || d === 0) continue;
        if(!S.vis[idx(x,y)]) continue;
        t.push([x,y]);
      }
      return t;
    },
    fire(x, y){
      const p = S.player;
      const bow = p.eq.main && GROUND[p.eq.main].ranged;
      lungeAt(p, x, y, true); swing(p);
      shotAt(p.x, p.y, x, y, bow ? '\u2192' : '\u00b7');
      const e = entAt(x, y);
      if(e && !e.you){ damage(e, atkOf(p) + ri(3)); say(`hurl \u2014 ${KINDS[e.kind].name}`) }
      else say('hurl \u2014 miss');
      return true;
    },
  },
  {
    id: 'gather', g: '\u2302', name: 'gather', cost: 80, cd: 0,
    tiles(){
      const p = S.player, t = [];
      for(let dy = -1; dy <= 1; dy++) for(let dx = -1; dx <= 1; dx++){
        const x = p.x + dx, y = p.y + dy;
        if(inB(x,y) && S.ground.has(idx(x,y))) t.push([x,y]);
      }
      return t;
    },
    fire(x, y){
      const k = S.ground.get(idx(x,y));
      if(!k) return false;
      const G = GROUND[k];
      S.ground.delete(idx(x,y));
      S.player.inv[k] = (S.player.inv[k] || 0) + 1;
      say(G.cls === 'gear' ? `picked up ${G.name} ${G.g}`
                           : `gathered ${G.name} \u2014 ${G.traits}`);
      return true;
    },
  },
];

export const abilityById = id => ABIL.find(a => a.id === id);

export function validSet(id){
  const s = new Set();
  for(const [x,y] of abilityById(id).tiles()) s.add(idx(x,y));
  return s;
}

export const onCooldown = id => (S.cooldown[id] || 0) > S.clock;
