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

import { DENSITY as SPRITE_DENSITY, CAPES, CAPE_SIZE, MATERIALS as ART } from './gear-sprites.js';

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

/* ── cape: AUTHORED POSES, blitted.

   A simulated cape can only ever be filled polygons — no 1px specular run down
   a fold, no hand-placed accent in a deep pleat. It reads as hand-painted. The
   poses are drawn pixel by pixel in tools/sprites/author.mjs instead.

   Direction snaps to one of eight. Cardinal and 45-degree poses are AUTHORED at
   those angles; the remaining six directions come from 90-degree turns, which
   are pixel-exact. Nothing here ever rotates pixel art by an arbitrary angle. */
const CLOTH = ART.cloth;

export function capePose(e, gait){
  // the cape trails opposite the facing
  const ang = Math.atan2(-e.face.x, -e.face.y);
  const oct = ((Math.round(ang / (Math.PI / 4)) % 8) + 8) % 8;
  const diagonal = oct % 2 === 1;
  const quarter = diagonal ? (oct - 1) / 2 : oct / 2;

  let pose = 'rest';
  if(gait > 0.05) pose = ((e.x + e.y) & 1) ? 'swayL' : 'swayR';
  return { key: pose + (diagonal ? '45' : '0'), quarter };
}

function cape(ctx, e, gait){
  const { key, quarter } = capePose(e, gait);
  const rows = CAPES[key];
  if(!rows) return;

  /* Hung BEHIND the head, not from its centre. Centred on the body, the collar
     sits at the sphere's middle and the sphere covers everything but a sliver
     of hem. The offset is applied before the turn, in world space, so it is
     correct for the diagonal poses too. */
  const OFF = 5;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(bsize / 2 - e.face.x * OFF, bsize / 2 - e.face.y * OFF);
  ctx.rotate(quarter * Math.PI / 2);          // exact quarter turns only
  const o = -CAPE_SIZE / 2;
  for(let r = 0; r < CAPE_SIZE; r++){
    const row = rows[r];
    for(let x = 0; x < CAPE_SIZE; x++){
      const c = row[x];
      if(c === '.') continue;
      ctx.fillStyle = CLOTH[c];
      ctx.fillRect(o + x, o + r, 1.02, 1.02);
    }
  }
  ctx.restore();
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
export function drawAvatar(ctx, e, ax, ay, ox, oy, TS, breath, alpha, bodyR, held, gait){
  const b = buffer();
  cape(b, e, gait);
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
