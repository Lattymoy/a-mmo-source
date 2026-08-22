import { idx } from '../core/grid.js';
import { ri } from '../core/rng.js';
import { S } from '../core/state.js';

/* Anything lying on the floor. Two classes:
     flora — traits, not recipes; the crafting layer reads these
     gear  — shape-led glyphs. Gear is manufactured, so it takes its colour from
             the theme and never from the biome, same rule as entities.
   See docs/bible/02-Systems/Equipment.md. */
export const GROUND = {
  fiber:   { g: '"', name: 'fiber',   cls: 'flora', traits: 'fibrous'   },
  resin:   { g: '%', name: 'resin',   cls: 'flora', traits: 'resinous'  },
  crystal: { g: '*', name: 'crystal', cls: 'flora', traits: 'brittle'   },

  sword:   { g: '/', name: 'sword',  cls: 'gear', slot: 'main', atk: 3 },
  bow:     { g: '}', name: 'bow',    cls: 'gear', slot: 'main', atk: 3, twoHand: true, ranged: true },
  daggerR: { g: '>', name: 'dagger', cls: 'gear', slot: 'main', atk: 2 },
  daggerL: { g: '<', name: 'dagger', cls: 'gear', slot: 'off',  atk: 2 },
  shield:  { g: 'c', name: 'shield', cls: 'gear', slot: 'off',  def: 2 },
};

export const FLORA_KEYS = Object.keys(GROUND).filter(k => GROUND[k].cls === 'flora');
export const GEAR_KEYS  = Object.keys(GROUND).filter(k => GROUND[k].cls === 'gear');

export function scatterGround(open){
  S.ground = new Map();
  const nF = Math.floor(open.length * 0.035);
  for(let i = 0; i < nF; i++){
    const [x,y] = open[ri(open.length)];
    S.ground.set(idx(x,y), FLORA_KEYS[ri(FLORA_KEYS.length)]);
  }
  const nG = Math.max(4, Math.floor(open.length * 0.008));
  for(let i = 0; i < nG; i++){
    const [x,y] = open[ri(open.length)];
    S.ground.set(idx(x,y), GEAR_KEYS[ri(GEAR_KEYS.length)]);
  }
}
