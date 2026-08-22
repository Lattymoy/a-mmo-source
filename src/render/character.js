/* CHARACTER PRESENTATION — the wearer's motion: facing, hand nubs, breathing
   and gait.

   There was a cape here: a verlet rib simulation, then a set of authored pixel
   poses. Both are gone — Mac cut the cape from the design. Everything the cape
   needed that the rest of the character also needs (facing from motion) stayed;
   the cloth itself did not.

   Physics runs in TILE units, so behaviour is identical at every camera zoom
   and on every screen size, including the enlarged boss viewport. */

export function updateFacing(e, ax, ay){
  if(!e.face){ e.face = { x: 0, y: 1 }; e._lax = ax; e._lay = ay }
  const mx = ax - e._lax, my = ay - e._lay;
  if(Math.abs(mx) > 1e-4 || Math.abs(my) > 1e-4){
    const m = Math.hypot(mx, my) || 1;
    e.face.x += (mx/m - e.face.x) * 0.35;
    e.face.y += (my/m - e.face.y) * 0.35;
    const f = Math.hypot(e.face.x, e.face.y) || 1;
    e.face.x /= f; e.face.y /= f;
  }
  e._lax = ax; e._lay = ay;
}

/* ── THE HANDS
   Two floating nubs carried in FRONT of the wearer — the opposite end of the
   body's centre. With the cape gone they are the ONLY thing stating which way
   the character faces, so their forward placement is load-bearing.

   They are NOT attached. Each nub is its own spring-damped body chasing a
   target point, so it lags when the character sets off, overshoots when they
   stop, and drifts on its own idle cycle. Pinned at a fixed offset they read as
   painted-on dots; floating, they read as separate things travelling with the
   character. */
/* Detachment is the whole point, so the gap is a named budget rather than a
   number that happens to work. Both the ring and the nubs carry a heavy
   keyline that eats into the space between them, so the nominal gap has to
   cover that too or they read as welded on. */
export const BODY_R    = 0.40;  // widest the ring ever draws (unarmed)
export const KEYLINE   = 0.075; // stroke bleed, both edges combined
export const HAND_GAP  = 0.13;  // clear space the eye should actually see

export const HAND_FWD = 0.66;   // tiles ahead of centre
export const HAND_LAT = 0.40;   // tiles to either side — wide enough that the
                                // two nubs read as a pair, not as one blob
export const HAND_R   = 0.10;   // nub radius in tiles
const HAND_STIFF = 0.20;        // pull toward the target
const HAND_DAMP  = 0.87;        // low enough to overshoot, high enough to settle
const HAND_DRIFT = 0.032;       // independent idle float, tiles
/* Bounds are per-COMPONENT in facing space, not a single radius. A radius
   clamp alone cannot express "each hand keeps to its own side", which is the
   rule that stops them clashing when the character turns. */
export const HAND_FWD_MIN = 0.30;  // never falls behind
export const HAND_FWD_MAX = 0.80;
export const HAND_LAT_MIN = 0.28;  // never crosses the centreline
export const HAND_LAT_MAX = 0.62;
export const HAND_LEASH   = 1.02;  // implied by the caps above
// nor drift closer: body + its keyline + the visible gap + the nub + its keyline
export const HAND_MIN = BODY_R + KEYLINE + HAND_GAP + HAND_R;

/* The ideal position — where a rigidly-attached hand would sit. Pure, so it can
   be asserted, and so the spring has something to chase. */
export function handTargets(e, ax, ay, gait){
  const fx = e.face.x, fy = e.face.y;
  const px = -fy, py = fx;                     // perpendicular to facing
  return [-1, 1].map(side => {
    const swing = gait * 0.07 * side;          // one hand leads, the other trails
    return [
      ax + fx * (HAND_FWD + swing) + px * HAND_LAT * side,
      ay + fy * (HAND_FWD + swing) + py * HAND_LAT * side,
    ];
  });
}

const clamp = (v, lo, hi) => v < lo ? lo : (v > hi ? hi : v);

export function initHands(e, ax, ay){
  const t = handTargets(e, ax, ay, 0);
  e.hands = t.map(([x, y]) => ({ x, y, px: x, py: y }));
}

export function updateHands(e, ax, ay, now, dt, gait){
  if(!e.face) return;
  if(!e.hands) initHands(e, ax, ay);

  const k = Math.min(dt / 16.67, 3);
  const targets = handTargets(e, ax, ay, gait);

  const fx = e.face.x, fy = e.face.y;

  for(let i = 0; i < 2; i++){
    const h = e.hands[i];
    const [tx, ty] = targets[i];

    // each nub floats on its own cycle — different rate and phase, so the two
    // never bob in unison and never look like one rigid pair
    const ph = now / (760 + i * 190) + i * 2.1 + (e.x * 0.7 + e.y * 1.3);
    const dx = Math.cos(ph) * HAND_DRIFT;
    const dy = Math.sin(ph * 1.3) * HAND_DRIFT;

    let vx = (h.x - h.px) * HAND_DAMP;
    let vy = (h.y - h.py) * HAND_DAMP;
    h.px = h.x; h.py = h.y;

    vx += ((tx + dx) - h.x) * HAND_STIFF * k;
    vy += ((ty + dy) - h.y) * HAND_STIFF * k;

    h.x += vx * k;
    h.y += vy * k;

    /* Held in front of the body and each on its own side, solved in FACING
       space: `fwd` is how far ahead the nub is, `lat` how far to the side.

       A spring in world space drags the nubs backward whenever the character
       sets off, and swings them THROUGH each other whenever the character
       turns — the two targets sweep across the body and the springs follow.
       Confining each nub to its own side of the centreline makes clashing
       impossible by construction rather than by tuning. The lag survives in
       full; it just runs within these bounds. */
    const side = i === 0 ? -1 : 1;
    const px_ = -fy, py_ = fx;
    const ox_ = h.x - ax, oy_ = h.y - ay;

    let fwd = clamp(ox_ * fx + oy_ * fy, HAND_FWD_MIN, HAND_FWD_MAX);
    let mag = clamp(side * (ox_ * px_ + oy_ * py_), HAND_LAT_MIN, HAND_LAT_MAX);

    // radial floor last: this is the detachment gap from the body
    let r = Math.hypot(fwd, mag);
    if(r < HAND_MIN){
      const up = HAND_MIN / r;
      fwd = Math.min(HAND_FWD_MAX, fwd * up);
      mag = Math.min(HAND_LAT_MAX, mag * up);
      if(Math.hypot(fwd, mag) < HAND_MIN)   // a cap absorbed it: take the rest
        fwd = Math.min(HAND_FWD_MAX,
                       Math.max(fwd, Math.sqrt(Math.max(0, HAND_MIN**2 - mag**2))));
      if(Math.hypot(fwd, mag) < HAND_MIN)
        mag = Math.min(HAND_LAT_MAX,
                       Math.sqrt(Math.max(0, HAND_MIN**2 - fwd**2)));
    }

    h.x = ax + fx * fwd + px_ * side * mag;
    h.y = ay + fy * fwd + py_ * side * mag;
  }
}

/* A hand shows either a nub or what it is holding, never both — at thumb tile
   size a glyph and a dot in the same spot is mush. `held` is [off, main]. */
export function drawHands(ctx, e, ox, oy, TS, col, alpha, breath, bg, held){
  if(!e.hands) return;
  const r = TS * HAND_R * breath;
  for(let i = 0; i < e.hands.length; i++){
    if(held && held[i]) continue;
    const h = e.hands[i];
    const sx = h.x * TS - ox + TS/2, sy = h.y * TS - oy + TS/2;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.globalAlpha = alpha * 0.9;
    ctx.strokeStyle = bg;
    ctx.lineWidth = Math.max(1.5, TS * 0.075);   // same keyline as the cloth
    ctx.stroke();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = col;
    ctx.fill();
  }
}

/* Idle breathing. Slow, small, phase-offset per wearer by position so a crowd
   in the hub never pulses in unison. Deliberately out of step with the
   arm-state pulse (880ms against 260ms) so the two never read as one signal. */
export function breathT(e, now){
  const phase = (e.x * 0.7 + e.y * 1.3);
  return 1 + 0.045 * Math.sin(now / 880 + phase);
}

/* 0 at rest, 1 mid-step. Drives the walk bob and the weight shift. */
export function gaitT(e, now, MOVE_MS){
  const t = (now - e.at) / MOVE_MS;
  if(t < 0 || t >= 1) return 0;
  return Math.sin(t * Math.PI);
}
