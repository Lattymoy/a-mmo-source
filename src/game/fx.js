import { LUNGE_MS, SLASH_MS, SHOT_MS } from '../core/config.js';
import { S } from '../core/state.js';

/* Melee lunges INTO the target and settles back; ranged recoils the other way.
   On a phone the damage number is often unreadable mid-fight — motion is what
   tells you an exchange happened and which way it went. */
export function lungeAt(e, tx, ty, ranged){
  const dx = tx - e.x, dy = ty - e.y;
  const m = Math.hypot(dx, dy) || 1;
  e.lg = { dx: dx/m, dy: dy/m, amt: ranged ? -0.22 : 0.40,
           t0: performance.now(), dur: LUNGE_MS };
}

export function slashAt(ax, ay, tx, ty){
  S.fx.push({ type: 'slash', x: tx, y: ty, ang: Math.atan2(ty - ay, tx - ax),
              t0: performance.now(), dur: SLASH_MS });
}

export function shotAt(ax, ay, tx, ty, g){
  S.fx.push({ type: 'shot', x0: ax, y0: ay, x1: tx, y1: ty, g: g || '\u00b7',
              t0: performance.now(), dur: SHOT_MS });
}

/* The weapon swings, not the player — the ring must stay upright and legible
   while a fight is happening. */
export function swing(e){ e.sw = { t0: performance.now(), dur: LUNGE_MS } }
