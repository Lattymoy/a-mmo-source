/* GEAR RENDERING — pixel art.

   Gear is drawn, not lettered, both in the hand and lying on the ground. The
   sprites are pixel grids rather than vector curves: at a thumb-sized tile a
   curve turns to mush, while a pixel grid stays crisp and is authored by eye.

   Rows use palette LETTERS, not colours, so one sprite renders in any material.
   Progression is material driven — bosses drop material, material builds
   weaponry — so a weapon must say what it is made of before any stat is read.

   Sprites point along -Y ("up"). The caller has already translated to the hand
   and rotated to facing, so a sprite never needs to know which way it points.

   `grip` is the pixel the hand actually holds, so a sword hangs from its handle
   rather than from its middle. `tiles` is the sprite's height in tile units.

   The pixel data itself is GENERATED — see tools/sprites/author.mjs and
   `npm run sprites`. This file is the renderer only. */

import { MATERIALS, SPRITES, GEAR_ART } from './gear-sprites.js';
export { MATERIALS, SPRITES, GEAR_ART };


export const hasArt = key => !!GEAR_ART[key];
const spriteOf = key => SPRITES[GEAR_ART[key]];

/* How far a sprite reaches BACKWARD from its grip, in tiles. */
export function rearReach(key){
  const s = spriteOf(key);
  if(!s) return 0;
  return (s.rows.length - s.grip[1]) * s.tiles / s.rows.length;
}

/* An anchor close to the body would put the sprite's grip end over the level
   digit — the bow is the worst case, since a two-hander is held between the
   hands and its riser sits well forward of its string. Rather than shrink
   sprites until they happen to fit, the ANCHOR is pushed out until the sprite
   clears. True by construction, at any pace, facing or hand position. */
export function clearAnchor(hx, hy, ax, ay, key, bodyEdge, fx = 0, fy = -1){
  const need = bodyEdge + rearReach(key);
  const dx = hx - ax, dy = hy - ay;
  const d = Math.hypot(dx, dy);
  if(d >= need) return [hx, hy];
  if(d === 0) return [ax + fx * need, ay + fy * need];   // no direction: use facing
  return [ax + dx / d * need, ay + dy / d * need];
}

export function drawGearArt(ctx, key, TS, bg){
  const s = spriteOf(key);
  if(!s) return false;
  const M = MATERIALS[s.material];
  const h = s.rows.length, w = s.rows[0].length;
  const px = TS * s.tiles / h;
  const x0 = -s.grip[0] * px - px / 2;      // hang from the grip, not the middle
  const y0 = -s.grip[1] * px - px / 2;

  for(let r = 0; r < h; r++){
    const row = s.rows[r];
    for(let x = 0; x < w; x++){
      const c = row[x];
      if(c === '.') continue;
      ctx.fillStyle = M[c] || bg;
      // half-pixel overlap: without it a rotated sprite shows seams between cells
      ctx.fillRect(x0 + x * px, y0 + r * px, px + 0.5, px + 0.5);
    }
  }
  return true;
}
