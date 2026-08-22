/* THE AVATAR — the player, rendered as pixel art.

   The problem this solves: the cape has to keep FLOWING (it is a live verlet
   sim, not a pose) while looking hand-drawn and hard-edged. Authoring cape
   frames as sprites would kill the physics; drawing it with canvas paths gives
   soft antialiased edges that read as vector art next to the gear.

   So the whole avatar is drawn into a small offscreen buffer at the game's
   pixel density, quantized to a fixed palette with hard alpha, and blitted up
   with smoothing off. Anything drawn into that buffer becomes pixel art,
   including geometry that changes every frame.

   Density is derived from the gear sprites, not chosen separately — one pixel
   size for the entire game, or the character and its sword would visibly
   disagree about how big a pixel is. */

import { DENSITY as SPRITE_DENSITY } from './gear-sprites.js';

// the game's one pixel size, shared with every gear sprite
export const DENSITY = SPRITE_DENSITY;
const SPAN = 2.4;                                   // tiles the buffer covers

export const AVATAR = {
  K:  '#151013',   // outline
  // cape
  R1: '#5A0A0E',   // deepest fold
  R2: '#7E0F14',   // shadow
  R3: '#C0161C',   // body
  R4: '#E8323A',   // lit fold
  // body and hands
  G1: '#6E6E74',   // rim shadow
  G2: '#A8A8B0',   // mid
  G3: '#DCDCE2',   // lit
  G4: '#FFFFFF',   // highlight
};

const PAL = Object.values(AVATAR).map(h => [
  parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)]);

let buf = null, bctx = null, bsize = 0;

function buffer(){
  const px = Math.ceil(SPAN * DENSITY);
  if(bsize !== px){
    buf = document.createElement('canvas');
    buf.width = buf.height = px;
    bctx = buf.getContext('2d', { willReadFrequently: true });
    bsize = px;
  }
  bctx.setTransform(1, 0, 0, 1, 0, 0);
  bctx.clearRect(0, 0, px, px);
  // 1 unit = 1 tile, origin at the wearer
  bctx.setTransform(DENSITY, 0, 0, DENSITY, px/2, px/2);
  bctx.lineJoin = 'round';
  bctx.lineCap = 'round';
  return bctx;
}

/* Canvas antialiases every path it draws, so the low-res buffer alone would
   give soft "blurry pixel art". Snapping alpha and clamping every colour to the
   palette is what makes the result hard-edged and flat, like the reference. */
function quantize(){
  const px = bsize;
  const img = bctx.getImageData(0, 0, px, px);
  const d = img.data;
  for(let i = 0; i < d.length; i += 4){
    if(d[i+3] < 128){ d[i+3] = 0; continue }
    d[i+3] = 255;
    let best = 0, bd = Infinity;
    for(let p = 0; p < PAL.length; p++){
      const dr = d[i]-PAL[p][0], dg = d[i+1]-PAL[p][1], db = d[i+2]-PAL[p][2];
      const dist = dr*dr + dg*dg + db*db;
      if(dist < bd){ bd = dist; best = p }
    }
    d[i] = PAL[best][0]; d[i+1] = PAL[best][1]; d[i+2] = PAL[best][2];
  }
  bctx.setTransform(1, 0, 0, 1, 0, 0);
  bctx.putImageData(img, 0, 0);
}

/* ── cape: pleats, collar, hem.
   Each rib becomes a PLEAT — a quad from the collar to the hem, shaded by
   alternating tone. Pleats are what the reference has that a smooth silhouette
   does not: the cloth reads as gathered fabric rather than a cut-out. */
function cape(ctx, e, ax, ay, breath){
  if(!e.cape) return;
  const P = n => [n.x - ax, n.y - ay];
  const ribs = e.cape;
  const last = ribs.length - 1;
  const tip = j => P(ribs[j][ribs[j].length - 1]);

  /* The hem NOTCHES between pleats: each rib tip is a point, and the gap
     between two tips cuts back toward the collar. A hem running straight from
     tip to tip reads as a cut-out; the notches make it cloth gathered in folds.

     The inset is a FIXED distance, not a fraction of the cape's length. Scaling
     it turned every pleat into a spike — a long cape got a proportionally
     enormous notch and the whole thing read as flames. */
  const NOTCH = 0.11;
  const notchAt = (a, b) => {
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    const d = Math.hypot(mx, my) || 1;
    return [mx - mx / d * NOTCH, my - my / d * NOTCH];
  };
  const hem = () => {
    for(let j = 1; j < ribs.length; j++){
      const a = tip(j - 1), b = tip(j);
      const n = notchAt(a, b);
      ctx.lineTo(n[0], n[1]);
      ctx.lineTo(b[0], b[1]);
    }
  };

  const shell = () => {
    ctx.beginPath();
    const a = P(ribs[0][0]);
    ctx.moveTo(a[0], a[1]);
    for(let i = 1; i < ribs[0].length; i++){ const p = P(ribs[0][i]); ctx.lineTo(p[0], p[1]) }
    hem();
    for(let i = ribs[last].length - 2; i >= 0; i--){ const p = P(ribs[last][i]); ctx.lineTo(p[0], p[1]) }
    for(let j = last - 1; j >= 1; j--){ const p = P(ribs[j][0]); ctx.lineTo(p[0], p[1]) }
    ctx.closePath();
  };

  ctx.strokeStyle = AVATAR.K;
  ctx.lineWidth = 0.10;
  shell(); ctx.stroke();
  ctx.fillStyle = AVATAR.R3;
  shell(); ctx.fill();

  /* Pleats. Four tones stepped hard rather than blended — at this pixel size a
     gentle gradient quantizes to a single flat colour and the folds vanish. */
  const TONE = [AVATAR.R2, AVATAR.R4, AVATAR.R1, AVATAR.R3];
  for(let j = 0; j < last; j++){
    const A = ribs[j], B = ribs[j + 1];
    ctx.beginPath();
    const a0 = P(A[0]); ctx.moveTo(a0[0], a0[1]);
    for(let i = 1; i < A.length; i++){ const p = P(A[i]); ctx.lineTo(p[0], p[1]) }
    const n = notchAt(tip(j), tip(j + 1));
    ctx.lineTo(n[0], n[1]);                    // the same notch, so pleat meets hem
    for(let i = B.length - 1; i >= 0; i--){ const p = P(B[i]); ctx.lineTo(p[0], p[1]) }
    ctx.closePath();
    ctx.fillStyle = TONE[j % TONE.length];
    ctx.fill();
  }

  /* Hard black creases between pleats. Without them the tones abut directly and
     the cape reads as a colour ramp instead of separate folds. */
  ctx.strokeStyle = AVATAR.K;
  ctx.lineWidth = 0.045;
  for(let j = 1; j < last; j++){
    const rib = ribs[j];
    ctx.beginPath();
    const s0 = P(rib[0]); ctx.moveTo(s0[0], s0[1]);
    for(let i = 1; i < rib.length; i++){ const p = P(rib[i]); ctx.lineTo(p[0], p[1]) }
    ctx.stroke();
  }

  // collar: the band the cloth gathers into, behind the head
  const cr = 0.44 * breath;   // wider than the head, so a band actually shows
  ctx.beginPath();
  ctx.arc(-e.face.x * 0.06, -e.face.y * 0.06, cr, 0, Math.PI * 2);
  ctx.strokeStyle = AVATAR.K;
  ctx.lineWidth = 0.09;
  ctx.stroke();
  ctx.fillStyle = AVATAR.R2;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-e.face.x * 0.06, -e.face.y * 0.06, cr - 0.07, 0, Math.PI * 2);
  ctx.strokeStyle = AVATAR.R1;
  ctx.lineWidth = 0.05;
  ctx.stroke();
}

/* A shaded sphere: rim, body, lit face, highlight. Four tones is all it takes,
   and all it should take — more and it stops matching the gear. */
/* A shaded sphere. Small ones drop the inner steps: at hand size the four
   circles land inside three pixels and the whole thing collapses to a speck. */
function sphere(ctx, cx, cy, r, tone, small){
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.strokeStyle = AVATAR.K;
  ctx.lineWidth = r * (small ? 0.5 : 0.34);
  ctx.stroke();
  ctx.fillStyle = tone[0]; ctx.fill();

  ctx.beginPath(); ctx.arc(cx - r*0.10, cy - r*0.12, r*0.80, 0, Math.PI*2);
  ctx.fillStyle = tone[1]; ctx.fill();

  ctx.beginPath(); ctx.arc(cx - r*0.16, cy - r*0.20, r*(small ? 0.52 : 0.58), 0, Math.PI*2);
  ctx.fillStyle = tone[2]; ctx.fill();

  if(small) return;
  ctx.beginPath(); ctx.arc(cx - r*0.26, cy - r*0.30, r*0.26, 0, Math.PI*2);
  ctx.fillStyle = tone[3]; ctx.fill();
}

const BODY_TONE = [AVATAR.G1, AVATAR.G2, AVATAR.G3, AVATAR.G4];

/** Draws cape, body and hands as one pixel-art unit. Returns the blit rect so
 *  the caller can put the level digit on top at full resolution. */
export function drawAvatar(ctx, e, ax, ay, ox, oy, TS, breath, alpha, bodyR, held){
  const b = buffer();
  cape(b, e, ax, ay, breath);
  sphere(b, 0, 0, bodyR * breath, BODY_TONE);
  if(e.hands)
    for(let i = 0; i < e.hands.length; i++){
      if(held && held[i]) continue;      // a hand shows a nub OR what it holds
      const h = e.hands[i];
      sphere(b, h.x - ax, h.y - ay, 0.15 * breath, BODY_TONE, true);
    }
  quantize();

  const size = SPAN * TS;
  const sx = ax * TS - ox + TS/2 - size/2;
  const sy = ay * TS - oy + TS/2 - size/2;
  const prev = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = alpha;
  ctx.drawImage(buf, sx, sy, size, size);
  ctx.imageSmoothingEnabled = prev;
  ctx.globalAlpha = 1;
}
