/* THE CAPE — the character's primary visual equipment.

   A verlet chain hanging off the player, integrated in real time rather than on
   the tick. That distinction matters: the cape is presentation, so it keeps
   flowing while the clock is held waiting for input. A player standing still
   deciding their next tap is still alive on screen.

   Physics runs in TILE units, not pixels, so the cloth behaves identically at
   every camera zoom and on every screen size. */

export const CAPE_N   = 8;      // anchor + 7 cloth nodes — enough for real curvature
export const CAPE_SEG = 0.19;   // tile lengths between nodes
const DAMP   = 0.90;            // velocity retained per frame
const DRAG   = 0.16;            // pull toward the trailing rest pose
const SWAY   = 0.16;            // ripple amplitude
const WAVE   = 0.80;            // phase shift per node — makes the sway travel
const MAX_BEND = 0.42;          // radians per joint
export const SHOULDER = 0.13;   // anchor sits behind the ring, not under it

export function initCape(e){
  e.cape = [];
  for(let i = 0; i < CAPE_N; i++)
    e.cape.push({ x: e.x, y: e.y + i * CAPE_SEG, px: e.x, py: e.y + i * CAPE_SEG });
  e.face = { x: 0, y: 1 };      // trails south until the wearer moves
  e._lax = e.x; e._lay = e.y;
}

/* ax, ay is the wearer's interpolated position this frame — lunge included, so
   the cape whips on an attack for free. */
export function updateCape(e, ax, ay, now, dt){
  if(!e.cape) initCape(e);

  // facing comes from actual motion, so a dash throws the cloth the right way
  const mx = ax - e._lax, my = ay - e._lay;
  if(Math.abs(mx) > 1e-4 || Math.abs(my) > 1e-4){
    const m = Math.hypot(mx, my) || 1;
    e.face.x += (mx/m - e.face.x) * 0.35;
    e.face.y += (my/m - e.face.y) * 0.35;
    const f = Math.hypot(e.face.x, e.face.y) || 1;
    e.face.x /= f; e.face.y /= f;
  }
  e._lax = ax; e._lay = ay;

  const k = Math.min(dt / 16.67, 3);           // frame-rate independence, clamped
  const n = e.cape;

  // anchor at the shoulders, behind the ring, so the cloth hangs off the body
  const anx = ax - e.face.x * SHOULDER, any = ay - e.face.y * SHOULDER;
  n[0].x = anx; n[0].y = any;
  n[0].px = anx; n[0].py = any;

  const phase = now / 560 + (e.x * 0.7 + e.y * 1.3);

  // ── integrate
  for(let i = 1; i < n.length; i++){
    const p = n[i];
    let vx = (p.x - p.px) * DAMP;
    let vy = (p.y - p.py) * DAMP;
    p.px = p.x; p.py = p.y;

    /* Drag toward where the cloth WANTS to lie: strung out behind the wearer,
       with a ripple that TRAVELS down its length. A single shared sway just
       wags the whole sheet, which reads as a flag on a pole. */
    const t = SHOULDER + i * CAPE_SEG;
    const sway = Math.sin(phase - i * WAVE) * SWAY * (i / n.length);
    const rx = ax - e.face.x * t - e.face.y * sway;
    const ry = ay - e.face.y * t + e.face.x * sway;
    vx += (rx - p.x) * DRAG * k;
    vy += (ry - p.y) * DRAG * k;

    p.x += vx * k;
    p.y += vy * k;
  }

  /* ── solve, shoulders outward.
     Length alone is not enough: a chain constrained only by segment length can
     fold straight back and pile onto the wearer, which is exactly what it did.
     Each joint is also limited in how far it may bend from the one before it,
     so the cloth can flow and curl but never collapse onto the body. */
  let px = -e.face.x, py = -e.face.y;          // direction of the previous link
  for(let i = 1; i < n.length; i++){
    const p = n[i], par = n[i-1];

    let dx = p.x - par.x, dy = p.y - par.y;
    const d = Math.hypot(dx, dy) || 1;
    dx /= d; dy /= d;

    // clamp this link's angle against the previous one
    const cos = dx*px + dy*py;
    if(cos < Math.cos(MAX_BEND)){
      const cross = px*dy - py*dx;             // which side it swung to
      const a = Math.atan2(py, px) + (cross >= 0 ? MAX_BEND : -MAX_BEND);
      dx = Math.cos(a); dy = Math.sin(a);
    }

    p.x = par.x + dx * CAPE_SEG;
    p.y = par.y + dy * CAPE_SEG;
    px = dx; py = dy;
  }
}

/* Tapered cloth, drawn as one filled polygon: wide at the shoulders, closing to
   a point at the tail. Rendered BEFORE the ring so it can never sit on top of
   the level digit. */
export function drawCape(ctx, e, ox, oy, TS, col, alpha, breath){
  if(!e.cape) return;
  const n = e.cape;
  const sx = i => n[i].x * TS - ox + TS/2;
  const sy = i => n[i].y * TS - oy + TS/2;

  const W0 = TS * 0.46 * breath;   // shoulder half-width — wider than the ring
  const left = [], right = [];

  for(let i = 0; i < n.length; i++){
    const a = Math.max(0, i - 1), b = Math.min(n.length - 1, i + 1);
    let dx = n[b].x - n[a].x, dy = n[b].y - n[a].y;
    const d = Math.hypot(dx, dy) || 1;
    dx /= d; dy /= d;
    /* Broad across the shoulders, closing to a hem rather than a needle point —
       a cape that tapers to nothing reads as a flame. */
    const f = i / (n.length - 1);
    const w = W0 * (0.16 + 0.84 * (1 - f) ** 0.42);
    left.push([sx(i) - dy * w, sy(i) + dx * w]);
    right.push([sx(i) + dy * w, sy(i) - dx * w]);
  }

  /* Curved edges, not faceted ones. Straight segments between eight nodes read
     as folded card; quadratics through the midpoints read as cloth. */
  // `connect` matters: starting the return edge with moveTo would split this
  // into two subpaths and the cloth would fill as two hollow strips
  const edge = (pts, connect) => {
    if(connect) ctx.lineTo(pts[0][0], pts[0][1]);
    else ctx.moveTo(pts[0][0], pts[0][1]);
    for(let i = 1; i < pts.length - 1; i++){
      const mx = (pts[i][0] + pts[i+1][0]) / 2;
      const my = (pts[i][1] + pts[i+1][1]) / 2;
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    }
    const last = pts[pts.length-1];
    ctx.lineTo(last[0], last[1]);
  };
  const outline = () => {
    ctx.beginPath();
    edge(left, false);
    edge([...right].reverse(), true);
    ctx.closePath();
  };

  ctx.globalAlpha = alpha * 0.72;
  ctx.fillStyle = col;
  outline();
  ctx.fill();

  // a brighter hem picks the silhouette out against dark terrain
  ctx.globalAlpha = alpha * 0.95;
  ctx.strokeStyle = col;
  ctx.lineWidth = Math.max(1, TS * 0.04);
  ctx.lineJoin = 'round';
  outline();
  ctx.stroke();
}

/* Idle breathing. Slow, small, and phase-offset per wearer so a crowd in the
   hub never pulses in unison. Deliberately out of step with the arm-state
   pulse (260ms) so the two never read as the same signal. */
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
