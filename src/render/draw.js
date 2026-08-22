import { MONO } from '../core/config.js';
import { idx, inB } from '../core/grid.js';
import { S } from '../core/state.js';
import { GROUND } from '../world/ground.js';
import { palette } from './themes.js';
import { view, canvas, context } from './camera.js';
import { updateCape, drawCape, updateHands, drawHands, breathT, gaitT } from './character.js';
import { drawGearArt, hasArt, clearAnchor } from './gear.js';
import { BODY_R, KEYLINE } from './character.js';

let lastDraw = 0;

/* Interpolated position: the move slide, with any lunge riding on top. */
export function pos(e, now){
  let x = e.x, y = e.y;
  const t = (now - e.at) / S.moveMs;
  if(t < 1){ const k = t*t*(3 - 2*t); x = e.ax + (e.x - e.ax)*k; y = e.ay + (e.y - e.ay)*k }
  if(e.lg){
    const u = (now - e.lg.t0) / e.lg.dur;
    if(u >= 1) e.lg = null;
    else { const p = Math.sin(u * Math.PI) * e.lg.amt; x += e.lg.dx * p; y += e.lg.dy * p }
  }
  return [x, y];
}

/* 0 at rest, 1 at full swing. */
export function swingT(e, now){
  if(!e.sw) return 0;
  const u = (now - e.sw.t0) / e.sw.dur;
  if(u >= 1){ e.sw = null; return 0 }
  return Math.sin(u * Math.PI);
}

function drawWallFace(ctx, mask, sx, sy, col){
  const h = view.TS / 2;
  if(!mask){                                   // isolated pillar
    ctx.fillStyle = col;
    ctx.fillRect(sx - view.TS*0.16, sy - view.TS*0.16, view.TS*0.32, view.TS*0.32);
    return;
  }
  ctx.strokeStyle = col;
  ctx.lineWidth = Math.max(1.5, view.TS * 0.11);
  ctx.lineCap = 'round';
  ctx.beginPath();
  if(mask & 1){ ctx.moveTo(sx,sy); ctx.lineTo(sx, sy - h) }
  if(mask & 2){ ctx.moveTo(sx,sy); ctx.lineTo(sx + h, sy) }
  if(mask & 4){ ctx.moveTo(sx,sy); ctx.lineTo(sx, sy + h) }
  if(mask & 8){ ctx.moveTo(sx,sy); ctx.lineTo(sx - h, sy) }
  ctx.stroke();
}

/* c○/   ○}   <○>
   Off hand left, main hand right, ring between. The ring shrinks when anything
   is held so all three fit one thumb-sized cell — that cost lands on the level
   digit, which was already the tightest thing at small sizes. */
function drawPlayer(ctx, e, sx, sy, T, now, breath){
  const TS = view.TS;
  /* The ring keeps full size now that gear hangs off the hands instead of
     crowding its sides — the level digit gets all the room back. */
  const r  = TS * 0.40 * breath;
  const lf = TS * 0.44;

  /* Filled, not just stroked: the cape passes behind the body and a hollow
     ring would let cloth show through the level digit. */
  ctx.beginPath();
  ctx.arc(sx, sy, r, 0, Math.PI * 2);
  ctx.fillStyle = T.bg;
  ctx.globalAlpha = 0.92;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = T.you;
  ctx.lineWidth = Math.max(1.3, TS * 0.07);
  ctx.stroke();
  ctx.fillStyle = T.you;

  const lab = String(e.lvl);
  ctx.save();
  ctx.font = `${Math.floor(lf)}px ${MONO}`;
  if(lab.length > 1){ ctx.translate(sx, sy); ctx.scale(0.66, 1); ctx.fillText(lab, 0, 0) }
  else ctx.fillText(lab, sx, sy);
  ctx.restore();

}

/* Gear is carried IN THE HANDS, so it inherits the nubs' float, lag and side
   confinement for free — a weapon can never end up behind the wearer or on the
   wrong side of them.

   Glyphs rotate with facing, which is what preserves the stated `c○/` reading
   in every direction: the shield stays on the off side and the sword on the
   main side however the character turns. */
function drawHeld(ctx, e, ox, oy, TS, T, now){
  if(!e.hands) return;
  const sw = swingT(e, now);
  const base = Math.atan2(e.face.y, e.face.x) + Math.PI / 2;

  const two = e.eq.main && GROUND[e.eq.main].twoHand;

  ctx.save();
  ctx.font = `${Math.floor(TS * 0.54)}px ${MONO}`;   // holds its weight beside the cape
  ctx.lineJoin = 'round';

  // a two-hander is held BETWEEN the hands, not in one of them
  const slots = two ? [['main', 0]] : [['off', 0], ['main', 1]];
  slots.forEach(([slot, i]) => {
    const k = e.eq[slot];
    if(!k) return;
    const raw = two
      ? { x: (e.hands[0].x + e.hands[1].x) / 2, y: (e.hands[0].y + e.hands[1].y) / 2 }
      : e.hands[i];
    // push the anchor out until the sprite's grip end clears the body
    const [hx, hy] = clearAnchor(raw.x, raw.y, e._lax, e._lay, k,
                                 BODY_R + KEYLINE, e.face.x, e.face.y);
    ctx.save();
    ctx.translate(hx * TS - ox + TS/2, hy * TS - oy + TS/2);
    const side = two ? 0 : (i ? 1 : -1);
    const cant = GROUND[k].cant || 0;
    // rest angle, then the swing on top: the weapon moves, not the wearer
    ctx.rotate(base + side * (cant + sw * 1.0));
    // drawn sprite if the item has one, otherwise its map glyph
    if(!drawGearArt(ctx, k, TS, T.bg)){
      ctx.lineWidth = Math.max(2, TS * 0.11);      // same keyline as cloth and nubs
      ctx.strokeStyle = T.bg;
      ctx.strokeText(GROUND[k].g, 0, 0);
      ctx.fillStyle = T.gear;
      ctx.fillText(GROUND[k].g, 0, 0);
    }
    ctx.restore();
  });
  ctx.restore();
}

export function draw(now){
  const ctx = context(), cv = canvas();
  if(!ctx) return;
  const dt = lastDraw ? Math.min(now - lastDraw, 100) : 16.67;
  lastDraw = now;
  const T = palette(S.theme, S.biome);
  const { dpr } = view;

  ctx.save();
  ctx.scale(dpr, dpr);
  const w = cv.width / dpr, h = cv.height / dpr;
  ctx.fillStyle = T.bg;
  ctx.fillRect(0, 0, w, h);

  const TS = view.TS, cols = view.cols, rows = view.rows;
  const [ppx, ppy] = pos(S.player, now);
  view.ox = Math.round((ppx - (cols-1)/2) * TS - (w - cols*TS)/2);
  view.oy = Math.round((ppy - (rows-1)/2) * TS - (h - rows*TS)/2);
  const { ox, oy } = view;

  ctx.font = `${Math.floor(TS * 0.78)}px ${MONO}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const x0 = Math.floor(ox/TS) - 1, y0 = Math.floor(oy/TS) - 1;
  const dim = S.armed ? 0.18 : 1;                 // the arm hush
  const pulse = 0.55 + 0.45 * Math.sin(now / 260);

  // ── terrain
  for(let y = y0; y < y0 + rows + 3; y++) for(let x = x0; x < x0 + cols + 3; x++){
    if(!inB(x,y) || !S.seen[idx(x,y)]) continue;
    const sx = x*TS - ox + TS/2, sy = y*TS - oy + TS/2;
    const v = S.vis[idx(x,y)];
    const isValid = S.valid && S.valid.has(idx(x,y));

    if(T.cell){
      ctx.globalAlpha = v ? (isValid ? 1 : dim) : 0.5 * dim;
      ctx.fillStyle = T.cell;
      const g = T.grid ? 1 : 0;
      ctx.fillRect(x*TS - ox + g, y*TS - oy + g, TS - g*2, TS - g*2);
    }
    if(isValid){
      ctx.globalAlpha = 0.20 * pulse;
      ctx.fillStyle = T.lit;
      ctx.fillRect(x*TS - ox + 1, y*TS - oy + 1, TS - 2, TS - 2);
    }

    const wallT = S.wall[idx(x,y)] === 1;
    const f = wallT ? S.wface[idx(x,y)] : 0;
    const buried = wallT && !f;
    ctx.globalAlpha = (v ? (isValid ? 1 : dim) : 0.55 * dim) * (buried ? 0.30 : 1);

    const fl = S.ground.get(idx(x,y));
    let col = !v ? T.mem
            : wallT ? T.wall
            : fl ? (GROUND[fl].cls === 'gear' ? T.gear : T.flora)
            : T.floor;
    if(isValid && !wallT) col = T.lit;
    ctx.shadowBlur = 0;

    if(f) drawWallFace(ctx, f - 1, sx, sy, col);
    else if(fl && hasArt(fl) && v){
      /* Dropped gear draws as its sprite, lying at an angle derived from the
         tile index — deterministic, so it never flickers between frames, and
         varied, so a floor of loot does not look like a rack. Only in direct
         view: remembered tiles stay glyphs, since memory is not detail. */
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(((Math.imul(idx(x, y), 2654435761) >>> 0) % 3600) / 3600 * Math.PI * 2);
      ctx.scale(0.82, 0.82);
      drawGearArt(ctx, fl, TS, T.bg);
      ctx.restore();
    }
    else {
      ctx.fillStyle = col;
      ctx.fillText(wallT ? T.wallGlyph : (fl ? GROUND[fl].g : T.floorGlyph), sx, sy);
    }
  }

  // ── actors
  for(const e of S.ents){
    if(e.hp <= 0 || !S.vis[idx(e.x, e.y)]) continue;
    const [ex, ey] = pos(e, now);
    const sx = ex*TS - ox + TS/2, sy = ey*TS - oy + TS/2;

    ctx.globalAlpha = e.you ? 1 : dim;
    ctx.fillStyle = e.you ? T.you : T.mon;
    if(T.glow){ ctx.shadowBlur = T.glow; ctx.shadowColor = ctx.fillStyle }

    if(e.you){
      const breath = breathT(e, now);
      const gait = gaitT(e, now, S.moveMs);
      // weight shifts back as the step lands, and the body rises a touch
      const lean = gait * TS * 0.05;
      const bob  = gait * TS * 0.06;
      updateCape(e, ex, ey, now, dt);
      updateHands(e, ex, ey, now, dt, gait);      // solve before anything draws on them
      drawCape(ctx, e, ox, oy, TS, T.cape, dim, breath, T.bg);
      ctx.globalAlpha = 1;
      ctx.fillStyle = T.you;
      if(T.glow){ ctx.shadowBlur = T.glow; ctx.shadowColor = T.you }
      drawPlayer(ctx, e, sx - e.face.x * lean, sy - e.face.y * lean - bob, T, now, breath);
      // hands and what they carry last: they float in front of everything
      const twoHanded = e.eq.main && GROUND[e.eq.main].twoHand;
      drawHands(ctx, e, ox, oy, TS, T.you, dim, breath, T.bg,
                twoHanded ? [1, 1] : [e.eq.off, e.eq.main]);
      drawHeld(ctx, e, ox, oy, TS, T, now);
    }
    else ctx.fillText(e.glyph, sx, sy);
    ctx.shadowBlur = 0;

    if(!e.you && e.hp < e.max){
      ctx.globalAlpha = dim * 0.8;
      ctx.fillStyle = T.mon;
      ctx.fillRect(ex*TS - ox + 3, ey*TS - oy + TS - 3, (TS - 6) * (e.hp / e.max), 1.5);
    }
  }

  // ── fx, over actors
  S.fx = S.fx.filter(f => now - f.t0 < f.dur);
  for(const f of S.fx){
    const u = (now - f.t0) / f.dur;
    if(f.type === 'slash'){
      if(!S.vis[idx(f.x, f.y)]) continue;
      const cx = f.x*TS - ox + TS/2, cy = f.y*TS - oy + TS/2;
      ctx.globalAlpha = Math.sin((1 - u) * Math.PI/2) * dim;
      ctx.strokeStyle = T.gear;
      ctx.lineWidth = Math.max(1.5, TS * 0.09);
      ctx.lineCap = 'round';
      const a0 = f.ang - 0.85 + u * 1.7;
      ctx.beginPath();
      ctx.arc(cx, cy, TS * 0.42, a0, a0 + 0.9);
      ctx.stroke();
    } else if(f.type === 'shot'){
      const px = f.x0 + (f.x1 - f.x0) * u, py = f.y0 + (f.y1 - f.y0) * u;
      const rx = Math.round(px), ry = Math.round(py);
      if(!inB(rx, ry) || !S.vis[idx(rx, ry)]) continue;
      ctx.globalAlpha = dim;
      ctx.fillStyle = T.gear;
      ctx.save();
      ctx.translate(px*TS - ox + TS/2, py*TS - oy + TS/2);
      ctx.rotate(Math.atan2(f.y1 - f.y0, f.x1 - f.x0));
      ctx.fillText(f.g, 0, 0);
      ctx.restore();
    }
  }

  // ── queued route
  ctx.globalAlpha = 1;
  if(S.path.length && !S.armed){
    ctx.globalAlpha = 0.30;
    ctx.fillStyle = T.lit;
    for(const [x,y] of S.path)
      ctx.fillRect(x*TS - ox + TS/2 - 1.5, y*TS - oy + TS/2 - 1.5, 3, 3);
  }

  ctx.globalAlpha = 1;
  if(S.cam === 'tactical'){
    ctx.fillStyle = 'rgba(5,7,10,.45)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#5C6E7A';
    ctx.font = `10px ${MONO}`;
    ctx.fillText('TACTICAL \u2014 TAP TO RETURN', w/2, h - 16);
  }
  ctx.restore();
}
