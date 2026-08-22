/* THE AVATAR — the player, rendered as pixel art.

   The body and hand nubs are drawn into a small offscreen buffer at the game's
   pixel density, quantized to a fixed palette with hard alpha, and blitted up
   with smoothing off. Canvas antialiases every path it draws, so the buffer
   alone would give soft "blurry pixel art"; the quantize pass is what makes the
   result flat and hard-edged.

   Density is derived from the gear sprites, not chosen separately — one pixel
   size for the entire game, or the character and its sword would visibly
   disagree about how big a pixel is. */

import { DENSITY as SPRITE_DENSITY } from './gear-sprites.js';

// the game's one pixel size, shared with every gear sprite
export const DENSITY = SPRITE_DENSITY;
const SPAN = 1.6;                                   // tiles the buffer covers

export const AVATAR = {
  K:  '#151013',   // outline
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

/** Draws the body and hand nubs as one pixel-art unit, quantized together so
 *  they share one palette. The level digit goes on top at full resolution. */
export function drawAvatar(ctx, e, ax, ay, ox, oy, TS, breath, alpha, bodyR, held){
  const b = buffer();
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
