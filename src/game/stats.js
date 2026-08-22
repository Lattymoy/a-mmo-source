import { BASE_ATK } from '../core/config.js';
import { S } from '../core/state.js';
import { GROUND } from '../world/ground.js';

/* Weapons raise Attack, a shield raises Defense — stated. Values live in
   GROUND. Nothing here varies tick cost by weapon: see Open Questions. */
export function atkOf(p){
  let a = BASE_ATK;
  for(const k of [p.eq.main, p.eq.off]) if(k && GROUND[k].atk) a += GROUND[k].atk;
  return a;
}

export function defOf(p){
  let d = 0;
  for(const k of [p.eq.main, p.eq.off]) if(k && GROUND[k].def) d += GROUND[k].def;
  return d;
}

/* c○/   ○}   <○>
   Off hand and main hand. A two-hander occupies both. Tapping an equipped item
   takes it off. */
export function equip(k){
  const G = GROUND[k];
  if(!G || G.cls !== 'gear') return;
  const p = S.player, slot = G.slot;

  if(p.eq[slot] === k){ p.eq[slot] = null; return }

  p.eq[slot] = k;
  if(G.twoHand) p.eq.off = null;
  else if(slot === 'off' && p.eq.main && GROUND[p.eq.main].twoHand) p.eq.main = null;
}
