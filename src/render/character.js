/* CHARACTER PRESENTATION — everything the wearer is made of besides the ring:
   the cape, the hand nubs, breathing, and gait.

   ── THE CAPE — the character's primary visual equipment.

   A mantle, not a tail. It anchors on an arc across the shoulders, wraps around
   the body, spreads wider than the wearer, and trails to a scalloped hem.

   Modelled as RIBS: several short verlet chains fanned across the back. Ribs
   are what make it cloth rather than a pennant — the hem's lobes fall out of
   the rib tips for free, and the ribs double as fold lines when shaded.

   Integrated in REAL TIME, not on the tick. The cape keeps flowing while the
   clock is held waiting for input, so a player standing still deciding their
   next tap is still alive on screen. In a game where time stops constantly,
   this is what stops the world looking frozen.

   Physics runs in TILE units, so the cloth behaves identically at every camera
   zoom and on every screen size, including the enlarged boss viewport. */

export const RIBS     = 7;      // fan across the back; alternating lengths curl the hem
export const RIB_N    = 5;      // nodes per rib, anchor included
export const RIB_SEG  = 0.20;   // tile lengths between nodes
export const SHOULDER = 0.36;   // anchor arc radius — pinned at the body's edge,
                                // not inside it, or only the tips would show
const SPREAD   = 1.62;          // half-angle of the shoulder arc — wide enough
                                // that the cloth wraps past the body's sides
const DAMP     = 0.90;          // velocity retained per frame
const DRAG     = 0.15;          // pull toward the trailing rest pose
const SWAY     = 0.12;          // ripple amplitude
const CURL     = 0.13;          // alternating rib length — soft lobes, no corners
const WAVE     = 0.85;          // phase shift per node — makes the sway travel
const MAX_BEND = 0.40;          // radians per joint
const SPILL    = 0.55;          // how strongly outer ribs sweep back behind

const ribT = j => (RIBS === 1 ? 0 : (j / (RIBS - 1)) * 2 - 1);   // -1..1 across the fan

export function initCape(e){
  e.face = { x: 0, y: 1 };      // trails south until the wearer moves
  e.cape = [];
  for(let j = 0; j < RIBS; j++){
    const rib = [];
    for(let i = 0; i < RIB_N; i++)
      rib.push({ x: e.x, y: e.y + i * RIB_SEG, px: e.x, py: e.y + i * RIB_SEG });
    e.cape.push(rib);
  }
  e._lax = e.x; e._lay = e.y;
}

/* ax, ay is the wearer's interpolated position this frame — lunge included, so
   the cape whips on an attack with no attack-specific code. */
export function updateCape(e, ax, ay, now, dt){
  if(!e.cape) initCape(e);

  const mx = ax - e._lax, my = ay - e._lay;
  if(Math.abs(mx) > 1e-4 || Math.abs(my) > 1e-4){
    const m = Math.hypot(mx, my) || 1;
    e.face.x += (mx/m - e.face.x) * 0.35;
    e.face.y += (my/m - e.face.y) * 0.35;
    const f = Math.hypot(e.face.x, e.face.y) || 1;
    e.face.x /= f; e.face.y /= f;
  }
  e._lax = ax; e._lay = ay;

  const k = Math.min(dt / 16.67, 3);          // frame-rate independence, clamped
  const back = Math.atan2(-e.face.y, -e.face.x);

  for(let j = 0; j < RIBS; j++){
    const rib = e.cape[j];
    const t = ribT(j);
    const aA = back + t * SPREAD;                       // where this rib is pinned
    const anx = ax + Math.cos(aA) * SHOULDER;
    const any = ay + Math.sin(aA) * SHOULDER;

    /* Outer ribs are pinned wide but still fall BACKWARD — that is what makes
       the cape wrap the body instead of splaying into a star. */
    const rA = aA - t * SPREAD * SPILL;
    const rdx = Math.cos(rA), rdy = Math.sin(rA);

    /* Centre ribs hang longest so the hem curves rather than cutting straight
       across, and alternate ribs run short. With a spline through the tips that
       alternation reads as soft curls — undulation without a single corner,
       which is what separates cloth from a bat wing. */
    const seg = RIB_SEG * (1 - 0.13 * Math.abs(t)) * (1 + (j % 2 ? -CURL : CURL * 0.5));
    const phase = now / 540 + j * 1.1 + (e.x * 0.7 + e.y * 1.3);

    rib[0].x = anx; rib[0].y = any;
    rib[0].px = anx; rib[0].py = any;

    for(let i = 1; i < rib.length; i++){
      const p = rib[i];
      let vx = (p.x - p.px) * DAMP;
      let vy = (p.y - p.py) * DAMP;
      p.px = p.x; p.py = p.y;

      /* Ripple TRAVELS down each rib and is offset between ribs. One shared
         sway wags the whole sheet, which reads as a flag on a pole. */
      const sway = Math.sin(phase - i * WAVE) * SWAY * (i / rib.length);
      const rx = anx + rdx * seg * i - rdy * sway;
      const ry = any + rdy * seg * i + rdx * sway;
      vx += (rx - p.x) * DRAG * k;
      vy += (ry - p.y) * DRAG * k;

      p.x += vx * k;
      p.y += vy * k;
    }

    /* Solve shoulders outward. Length alone is not enough: a chain constrained
       only by segment length folds straight back and piles onto the wearer,
       covering the level digit. Each joint is also angle-limited. */
    let pdx = rdx, pdy = rdy;
    for(let i = 1; i < rib.length; i++){
      const p = rib[i], par = rib[i-1];
      let dx = p.x - par.x, dy = p.y - par.y;
      const d = Math.hypot(dx, dy) || 1;
      dx /= d; dy /= d;

      const cos = dx*pdx + dy*pdy;
      if(cos < Math.cos(MAX_BEND)){
        const cross = pdx*dy - pdy*dx;
        const a = Math.atan2(pdy, pdx) + (cross >= 0 ? MAX_BEND : -MAX_BEND);
        dx = Math.cos(a); dy = Math.sin(a);
      }

      p.x = par.x + dx * seg;
      p.y = par.y + dy * seg;
      pdx = dx; pdy = dy;
    }
  }
}

/* ── rendering ─────────────────────────────────────────────────────────────
   The outline is ONE closed loop walked around the cloth: out along the first
   rib, across the hem through every rib tip, back in along the last rib, then
   home along the shoulder arc.

   It is drawn as a Catmull-Rom spline rather than as line segments. That is the
   whole difference between cloth and a bat wing: straight edges meeting at rib
   tips make hard points, and pulling the hem inward between tips cuts notches
   between them. A spline through the same points gives soft lobes, and the
   undulation comes from the ribs' own lengths instead of from carved notches. */
function catmullLoop(ctx, pts){
  const n = pts.length;
  const at = i => pts[(i % n + n) % n];
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for(let i = 0; i < n; i++){
    const p0 = at(i-1), p1 = at(i), p2 = at(i+1), p3 = at(i+2);
    ctx.bezierCurveTo(
      p1[0] + (p2[0]-p0[0])/6, p1[1] + (p2[1]-p0[1])/6,
      p2[0] - (p3[0]-p1[0])/6, p2[1] - (p3[1]-p1[1])/6,
      p2[0], p2[1]);
  }
  ctx.closePath();
}

export function drawCape(ctx, e, ox, oy, TS, col, alpha, breath, bg){
  if(!e.cape) return;
  const P = n => [n.x * TS - ox + TS/2, n.y * TS - oy + TS/2];

  const first = e.cape[0], last = e.cape[RIBS - 1];
  const loop = [];
  for(let i = 0; i < first.length; i++) loop.push(P(first[i]));          // out
  for(let j = 1; j < RIBS; j++) loop.push(P(e.cape[j][e.cape[j].length-1])); // hem
  for(let i = last.length - 2; i >= 0; i--) loop.push(P(last[i]));       // back in
  for(let j = RIBS - 2; j >= 1; j--) loop.push(P(e.cape[j][0]));         // shoulders

  // heavy dark keyline first — this is what lifts the cape off dark terrain
  ctx.lineJoin = 'round';
  ctx.globalAlpha = alpha * 0.9;
  ctx.strokeStyle = bg;
  ctx.lineWidth = Math.max(2, TS * 0.14);
  catmullLoop(ctx, loop);
  ctx.stroke();

  ctx.globalAlpha = alpha * 0.92;
  ctx.fillStyle = col;
  catmullLoop(ctx, loop);
  ctx.fill();

  // ribs as fold lines — cloth needs interior structure or it reads as a decal
  ctx.globalAlpha = alpha * 0.28;
  ctx.strokeStyle = bg;
  ctx.lineWidth = Math.max(1, TS * 0.045);
  ctx.lineCap = 'round';
  for(let j = 1; j < RIBS - 1; j++){
    const rib = e.cape[j];
    ctx.beginPath();
    const s0 = P(rib[0]);
    ctx.moveTo(s0[0], s0[1]);
    for(let i = 1; i < rib.length - 1; i++){
      const a = P(rib[i]), b = P(rib[i+1]);
      ctx.quadraticCurveTo(a[0], a[1], (a[0]+b[0])/2, (a[1]+b[1])/2);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = alpha;
}

/* ── THE HANDS
   Two floating nubs carried in FRONT of the wearer — the opposite end of the
   body from the cape, so together they state which way the character faces
   without any sprite rotation.

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
