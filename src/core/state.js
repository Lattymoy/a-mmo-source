/* One mutable world. Exported as an object rather than as `let` bindings so
   every module reads the same live values without import cycles. */

import { MS_PER_TICK, moveMsFor } from './config.js';

export const S = {
  // pace, adjustable at runtime
  msPerTick: MS_PER_TICK,
  moveMs: moveMsFor(MS_PER_TICK),

  // terrain
  wall:  null,   // Uint8Array, 1 = solid
  wface: null,   // Uint8Array, 0 = buried rock, else 1 + connection mask
  seen:  null,   // Uint8Array, ever explored
  vis:   null,   // Uint8Array, visible this turn
  ground: new Map(),   // idx -> GROUND key (flora and gear both lie on the floor)

  // actors
  ents: [],
  player: null,

  // scheduler
  clock: 0,
  waiting: false,
  dead: false,

  // intent
  path: [],
  queued: null,       // {type:'ability'|'attack', ...}
  armed: null,        // ability id, or null
  valid: null,        // Set of legal target idx while armed
  cooldown: {},

  // presentation
  fx: [],
  logs: [],
  theme: 'board',
  biome: 'uncorrupt',
  cam: 'close',
};

export function resetRun(){
  S.clock = 0;
  S.waiting = false;
  S.dead = false;
  S.path = [];
  S.queued = null;
  S.armed = null;
  S.valid = null;
  S.fx = [];
  S.logs = [];
  for(const k in S.cooldown) delete S.cooldown[k];
}
