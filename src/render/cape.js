/* THE CAPE — the character's primary visual equipment.

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

export const RIBS     = 5;      // fan across the back — 5 ribs give 4 hem lobes
export const RIB_N    = 5;      // nodes per rib, anchor included
export const RIB_SEG  = 0.20;   // tile lengths between nodes
export const SHOULDER = 0.36;   // anchor arc radius — pinned at the body's edge,
                                // not inside it, or only the tips would show
const SPREAD   = 1.62;          // half-angle of the shoulder arc — wide enough
                                // that the cloth wraps past the body's sides
const DAMP     = 0.90;          // velocity retained per frame
const DRAG     = 0.15;          // pull toward the trailing rest pose
const SWAY     = 0.13;          // ripple amplitude
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

    // centre ribs hang longest, so the hem reads as a curve not a straight cut
    const seg = RIB_SEG * (1 - 0.22 * Math.abs(t));
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

/* Outline: down the outer edge of the first rib, across the hem through every
   rib tip, up the outer edge of the last rib, closed across the shoulders.
   Hem control points are pulled toward the body so each gap between tips cuts
   inward — that notch is what makes the lobes read as a ragged hem. */
export function drawCape(ctx, e, ox, oy, TS, col, alpha, breath, bg){
  if(!e.cape) return;
  const P = n => [n.x * TS - ox + TS/2, n.y * TS - oy + TS/2];
  const cx = e._lax * TS - ox + TS/2, cy = e._lay * TS - oy + TS/2;

  const first = e.cape[0], last = e.cape[RIBS - 1];
  const tips = e.cape.map(r => P(r[r.length - 1]));

  const outline = () => {
    ctx.beginPath();
    const a = P(first[0]);
    ctx.moveTo(a[0], a[1]);
    for(let i = 1; i < first.length; i++){ const p = P(first[i]); ctx.lineTo(p[0], p[1]) }

    for(let j = 1; j < tips.length; j++){
      const t0 = tips[j-1], t1 = tips[j];
      const mx = (t0[0] + t1[0]) / 2, my = (t0[1] + t1[1]) / 2;
      ctx.quadraticCurveTo(mx + (cx - mx) * 0.34, my + (cy - my) * 0.34, t1[0], t1[1]);
    }

    for(let i = last.length - 2; i >= 0; i--){ const p = P(last[i]); ctx.lineTo(p[0], p[1]) }
    ctx.quadraticCurveTo(cx, cy, a[0], a[1]);   // close around the body
    ctx.closePath();
  };

  // heavy dark keyline first — this is what lifts the cape off dark terrain
  ctx.globalAlpha = alpha * 0.9;
  ctx.strokeStyle = bg;
  ctx.lineWidth = Math.max(2, TS * 0.13);
  ctx.lineJoin = 'round';
  outline();
  ctx.stroke();

  ctx.globalAlpha = alpha * 0.92;
  ctx.fillStyle = col;
  outline();
  ctx.fill();

  // ribs as fold lines — cloth needs interior structure or it reads as a decal
  ctx.globalAlpha = alpha * 0.30;
  ctx.strokeStyle = bg;
  ctx.lineWidth = Math.max(1, TS * 0.045);
  ctx.lineCap = 'round';
  for(let j = 1; j < RIBS - 1; j++){
    const rib = e.cape[j];
    ctx.beginPath();
    const s = P(rib[0]);
    ctx.moveTo(s[0], s[1]);
    for(let i = 1; i < rib.length; i++){ const p = P(rib[i]); ctx.lineTo(p[0], p[1]) }
    ctx.stroke();
  }
  ctx.globalAlpha = alpha;
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
