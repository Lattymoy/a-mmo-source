import { S } from '../core/state.js';
import { computeFOV } from '../world/fov.js';
import { playerAct, monsterAct } from './actions.js';
import { validSet } from './abilities.js';

/* Time only moves when someone acts, but nobody can stall it: an actor with
   nothing to do is skipped, not waited on.

   Wall-clock pace is a property of GAME TIME, not of actor count. The clock
   advances at a fixed real-time rate and every actor whose turn has come due
   resolves in the same pass — so adding monsters never slows the player.
   See docs/bible/02-Systems/Tick Scheduler.md. */
export function drain(onChange){
  for(let guard = 0; guard < 512; guard++){
    let a = null;
    for(const e of S.ents) if(e.hp > 0 && (!a || e.next < a.next)) a = e;
    if(!a || a.next > S.clock) return;

    if(a.you){
      const cost = playerAct();
      if(cost === 0){ S.waiting = true; return }   // nothing queued: hold the clock
      a.next += cost;
      computeFOV();
      if(S.armed) S.valid = validSet(S.armed);
    } else {
      a.next += monsterAct(a);
    }

    S.ents = S.ents.filter(e => e.hp > 0 || e.you);
    if(onChange) onChange();
    if(S.dead) return;
  }
}
