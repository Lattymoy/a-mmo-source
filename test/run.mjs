import { check, group, report, newWorld } from './harness.mjs';

const { S, openCount } = await newWorld(20260822);

const { W, H, MS_PER_TICK } = await import('../src/core/config.js');
const { idx }        = await import('../src/core/grid.js');
const { GROUND }     = await import('../src/world/ground.js');
const { KINDS }      = await import('../src/game/kinds.js');
const { atkOf, defOf, equip } = await import('../src/game/stats.js');
const { ABIL, validSet }      = await import('../src/game/abilities.js');
const { pathTo }     = await import('../src/world/path.js');
const { entAt }      = await import('../src/game/entities.js');

/* ── walls ─────────────────────────────────────────────────────────────── */
group('wall geometry');
{
  // every stroke toward a neighbour must be met by that neighbour's stroke back,
  // or a contour breaks visibly
  const B = [[1,0,-1,4],[2,1,0,8],[4,0,1,1],[8,-1,0,2]];
  let segs = 0, unmatched = 0, faces = 0;
  for(let y = 1; y < H-1; y++) for(let x = 1; x < W-1; x++){
    const f = S.wface[idx(x,y)];
    if(!f) continue;
    faces++;
    for(const [bit, dx, dy, back] of B){
      if(!((f-1) & bit)) continue;
      segs++;
      const nf = S.wface[idx(x+dx, y+dy)];
      if(!nf || !((nf-1) & back)) unmatched++;
    }
  }
  check('faces exist', faces > 50, `${faces}`);
  check('no broken contours', unmatched === 0, `${unmatched}/${segs} unmatched`);

  // a face must touch floor; buried rock must not
  let misclassified = 0;
  for(let y = 1; y < H-1; y++) for(let x = 1; x < W-1; x++){
    if(!S.wall[idx(x,y)]) continue;
    let touches = false;
    for(let dy=-1; dy<=1 && !touches; dy++) for(let dx=-1; dx<=1; dx++){
      if(!dx && !dy) continue;
      if(!S.wall[idx(x+dx,y+dy)]){ touches = true; break }
    }
    if(touches !== !!S.wface[idx(x,y)]) misclassified++;
  }
  check('face classification exact', misclassified === 0, `${misclassified} wrong`);
}

/* ── reachability ──────────────────────────────────────────────────────── */
group('map');
{
  check('open region non-trivial', openCount > 200, `${openCount} tiles`);
  let unreachable = 0, sampled = 0;
  for(let y = 0; y < H; y += 3) for(let x = 0; x < W; x += 3){
    if(S.wall[idx(x,y)]) continue;
    if(x === S.player.x && y === S.player.y) continue;
    sampled++;
    if(!pathTo(x,y).length) unreachable++;
  }
  check('every open tile reachable', unreachable === 0, `${unreachable}/${sampled}`);
}

/* ── equipment ─────────────────────────────────────────────────────────── */
group('equipment');
{
  const p = S.player;
  check('unarmed atk is base', atkOf(p) === 3, `${atkOf(p)}`);

  equip('sword');
  check('sword to main hand', p.eq.main === 'sword' && atkOf(p) === 6);

  equip('shield');   // c○/
  check('shield to off hand', p.eq.off === 'shield' && defOf(p) === 2);

  equip('bow');      // two-hander must clear the off hand
  check('bow clears off hand', p.eq.main === 'bow' && p.eq.off === null);

  equip('daggerL');  // off-hand item must clear a two-hander
  check('off hand clears two-hander', p.eq.off === 'daggerL' && p.eq.main === null);

  equip('daggerR');  // <○>
  check('paired daggers', p.eq.main === 'daggerR' && p.eq.off === 'daggerL' && atkOf(p) === 7);

  equip('daggerR');
  check('tap again unequips', p.eq.main === null && atkOf(p) === 5);

  p.eq.main = null; p.eq.off = null;
}

/* ── ground ────────────────────────────────────────────────────────────── */
group('ground');
{
  const p = S.player, gather = ABIL.find(a => a.id === 'gather');
  let got = 0;
  for(const k of Object.keys(GROUND)){
    S.ground.set(idx(p.x + 1, p.y), k);
    const legal = gather.tiles().some(([x,y]) => x === p.x+1 && y === p.y);
    if(legal && gather.fire(p.x + 1, p.y)) got++;
  }
  check('every ground kind gathers', got === Object.keys(GROUND).length,
        `${got}/${Object.keys(GROUND).length}`);
  check('inventory counted', Object.values(p.inv).every(n => n === 1));
}

/* ── abilities ─────────────────────────────────────────────────────────── */
group('abilities');
{
  // arming is modal, so every ability MUST be able to show its legal set
  for(const A of ABIL){
    check(`${A.id} declares tiles()`, typeof A.tiles === 'function');
    const set = validSet(A.id);
    check(`${A.id} legal set is a Set`, set instanceof Set);
  }
  // no ability may light a wall
  let onWall = 0;
  for(const A of ABIL) for(const i of validSet(A.id)) if(S.wall[i]) onWall++;
  check('no ability targets a wall', onWall === 0, `${onWall} tiles`);
}

/* ── scheduler ─────────────────────────────────────────────────────────── */
group('scheduler');
{
  // player pace must NOT depend on how many actors are on the clock
  const rate = (nMon) => {
    const ents = [{ you: true, next: 0 }];
    for(let i = 0; i < nMon; i++) ents.push({ you: false, next: 0, spd: [70,85,160][i%3] });
    let clock = 0, steps = 0;
    for(let t = 0; t < 10000; t += 16.67){
      clock += 16.67 / MS_PER_TICK;
      for(let g = 0; g < 512; g++){
        let a = null;
        for(const e of ents) if(!a || e.next < a.next) a = e;
        if(a.next > clock) break;
        if(a.you){ a.next += 100; steps++ } else a.next += a.spd;
      }
    }
    return steps;
  };
  const base = rate(0);
  check('pace independent of actor count',
        [16, 64, 256].every(n => rate(n) === base),
        `0:${base} 16:${rate(16)} 64:${rate(64)} 256:${rate(256)}`);
  check('pace is brisk', base / 10 > 12, `${(base/10).toFixed(1)} steps/sec`);
}

/* ── entities ──────────────────────────────────────────────────────────── */
group('entities');
{
  check('player is a ring', S.player.glyph === '\u25CB');
  check('base enemy is a box', KINDS.husk.g === '\u25A1');
  check('no entity uses a digit',
        S.ents.every(e => !/[0-9]/.test(e.glyph)));
  check('no ground item uses a digit',
        Object.values(GROUND).every(g => !/[0-9]/.test(g.g)));
  check('entAt finds the player', entAt(S.player.x, S.player.y) === S.player);
}

/* ── cape ──────────────────────────────────────────────────────────────── */
group('cape');
{
  const { initCape, updateCape, handPositions, RIBS, RIB_N, SHOULDER,
          HAND_FWD, HAND_R, breathT, gaitT } =
    await import('../src/render/character.js');
  // ribs vary in length (curl + centre bias), so reach is measured per rib
  const reachOf = seg => SHOULDER + (RIB_N - 1) * seg;

  const e = { x: 10, y: 10, at: -9999 };
  initCape(e);
  check('cape is ribbed', e.cape.length === RIBS && e.cape[0].length === RIB_N);

  let ax = 10, ay = 10, bad = 0, overlong = 0, stretched = 0;
  for(let f = 0; f < 900; f++){
    if(f < 300)      { ax += 0.04 }
    else if(f < 450) { ax += 0.30; ay += 0.30 }      // dash-speed motion
    else if(f < 700) { ax -= 0.06; ay -= 0.02 }      // hard reverse
    e.x = Math.round(ax); e.y = Math.round(ay);
    updateCape(e, ax, ay, f * 16.67, 16.67);

    for(const rib of e.cape){
      const seg = Math.hypot(rib[1].x - rib[0].x, rib[1].y - rib[0].y);
      for(let i = 0; i < rib.length; i++){
        const n = rib[i];
        if(!Number.isFinite(n.x) || !Number.isFinite(n.y)) bad++;
        if(i > 0){
          const p = rib[i-1];
          const d = Math.hypot(n.x - p.x, n.y - p.y);
          if(Math.abs(d - seg) > 1e-6) stretched++;   // hard length constraint
        }
      }
      const tip = rib[rib.length-1];
      if(Math.hypot(tip.x - ax, tip.y - ay) > reachOf(seg) + 1e-6) overlong++;
    }
  }
  check('cape never goes non-finite', bad === 0, `${bad} bad nodes`);
  check('segments never stretch', stretched === 0, `${stretched} violations`);
  check('cloth cannot exceed its length', overlong === 0, `${overlong} rib-frames`);

  // idle: must settle behind, not pool on top
  for(let f = 0; f < 400; f++) updateCape(e, ax, ay, (900+f) * 16.67, 16.67);
  const mid = e.cape[(RIBS/2)|0];
  const tip = mid[mid.length-1];
  const midSeg = Math.hypot(mid[1].x - mid[0].x, mid[1].y - mid[0].y);
  const trail = Math.hypot(tip.x - ax, tip.y - ay);
  check('settles trailing, not collapsed', trail > reachOf(midSeg) * 0.7,
        `tip ${trail.toFixed(3)} tiles behind`);
  const dot = ((tip.x-ax)*-e.face.x + (tip.y-ay)*-e.face.y) / (trail || 1);
  check('settles BEHIND the facing', dot > 0.8, `alignment ${dot.toFixed(2)}`);

  // the failure bend-limiting exists to prevent: cloth piling on the body
  let onBody = 0, bx = 10, by = 10;
  for(let f = 0; f < 1200; f++){
    bx += Math.sin(f / 7) * 0.22;
    by += Math.cos(f / 5) * 0.22;
    e.x = Math.round(bx); e.y = Math.round(by);
    updateCape(e, bx, by, f * 16.67, 16.67);
    for(const rib of e.cape)
      for(let i = 2; i < rib.length; i++)
        if(Math.hypot(rib[i].x - bx, rib[i].y - by) < SHOULDER * 0.8) onBody++;
  }
  check('cloth never piles onto the wearer', onBody === 0, `${onBody} node-frames`);

  // the cape must be WIDER than the body, or it is not a mantle
  const tips = e.cape.map(r => r[r.length-1]);
  let span = 0;
  for(const a of tips) for(const b of tips)
    span = Math.max(span, Math.hypot(a.x-b.x, a.y-b.y));
  check('hem spreads wider than the body', span > 0.8, `${span.toFixed(2)} tiles`);

  let lo = 9, hi = 0;
  for(let f = 0; f < 2000; f++){ const b = breathT(e, f*16.67); lo = Math.min(lo,b); hi = Math.max(hi,b) }
  check('breath stays subtle', lo > 0.94 && hi < 1.06, `${lo.toFixed(3)}..${hi.toFixed(3)}`);
  check('gait is 0 at rest', gaitT({ at: -9999 }, 0, 65) === 0);
}

/* ── hands ─────────────────────────────────────────────────────────────── */
group('hands');
{
  const { initCape, updateCape, handPositions, HAND_FWD, HAND_R, SHOULDER } =
    await import('../src/render/character.js');

  const e = { x: 5, y: 5, at: -9999 };
  initCape(e);
  // drive east so facing is unambiguous
  let ax = 5, ay = 5;
  for(let f = 0; f < 200; f++){ ax += 0.05; updateCape(e, ax, ay, f*16.67, 16.67) }

  const [L, R] = handPositions(e, ax, ay, 0);
  const ahead = p => (p[0]-ax)*e.face.x + (p[1]-ay)*e.face.y;
  check('both hands are in FRONT', ahead(L) > 0 && ahead(R) > 0,
        `${ahead(L).toFixed(2)}, ${ahead(R).toFixed(2)}`);

  const clear = p => Math.hypot(p[0]-ax, p[1]-ay) - HAND_R;
  check('hands clear the body ring', clear(L) > 0.40 && clear(R) > 0.40,
        `${clear(L).toFixed(3)}, ${clear(R).toFixed(3)}`);

  const sep = Math.hypot(L[0]-R[0], L[1]-R[1]);
  check('hands do not overlap each other', sep > HAND_R * 2, `${sep.toFixed(3)}`);

  // hands must sit opposite the cape, or facing reads ambiguously
  const mid = e.cape[(e.cape.length/2)|0];
  const tip = mid[mid.length-1];
  check('hands oppose the cape', ahead([tip.x, tip.y]) < 0,
        `cape at ${ahead([tip.x, tip.y]).toFixed(2)}`);

  // they swing in opposition through a step
  const [L2, R2] = handPositions(e, ax, ay, 1);
  const dL = ahead(L2) - ahead(L), dR = ahead(R2) - ahead(R);
  check('hands swing in opposition', dL * dR < 0, `${dL.toFixed(3)} vs ${dR.toFixed(3)}`);
}

report();
