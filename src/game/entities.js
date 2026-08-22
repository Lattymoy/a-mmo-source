import { dist } from '../core/grid.js';
import { ri } from '../core/rng.js';
import { S } from '../core/state.js';
import { KINDS } from './kinds.js';
import { say } from '../ui/log.js';

export const entAt = (x, y) => S.ents.find(e => e.hp > 0 && e.x === x && e.y === y);

export function makePlayer(x, y){
  return {
    x, y, ax: x, ay: y, at: -9999,
    glyph: '\u25CB', lvl: 1,
    hp: 20, max: 20, spd: 100, next: 0,
    you: true,
    inv: {},
    eq: { main: null, off: null },
  };
}

export function spawn(open){
  S.ents = [];
  const [px, py] = open[ri(open.length)];
  S.player = makePlayer(px, py);
  S.ents.push(S.player);

  const pool = ['husk','husk','husk','husk','heavy'];
  const n = 16;
  let tries = 0;
  while(S.ents.length < n + 1 && tries++ < 4000){
    const [x,y] = open[ri(open.length)];
    if(dist(x, y, px, py) < 12) continue;
    if(S.ents.some(e => e.x === x && e.y === y)) continue;
    const k = pool[ri(pool.length)], K = KINDS[k];
    S.ents.push({ x, y, ax: x, ay: y, at: -9999,
                  glyph: K.g, kind: k, hp: K.hp, max: K.hp, spd: K.spd, next: 0 });
  }
}

export function stepTo(e, x, y){
  e.ax = e.x; e.ay = e.y; e.at = performance.now();
  e.x = x; e.y = y;
}

export function damage(e, n){
  e.hp -= n;
  if(e.hp > 0) return;
  if(e.you){ S.dead = true; say('you died') }
  else say(`${KINDS[e.kind].name} dies`);
}
