/* SPRITE AUTHORING — the source of truth for every pixel of gear art.

   Sprites are BUILT, not typed. Each one is constructed from rules — taper by
   row, shading by column offset — and then hand-placed detail (grain, bindings,
   highlights) on top. That mix is what makes them read as drawn rather than as
   generated: the rules keep edges and shading consistent, the hand-placed
   pixels keep them from looking mechanical.

   `npm run sprites` regenerates src/render/gear-sprites.js and a preview sheet
   from this file. Never hand-edit the generated data — a test asserts the two
   are in sync, and it will fail.

   Palette letters, not colours, so one sprite renders in any material:
     K outline · D grain/shadow · M body · L lit face · H highlight · C sinew
*/

/* ONE pixel size for the entire game. A sprite's size in the world is a
   consequence of how many pixels it is drawn with — never of a scale factor
   chosen per item. Getting this wrong is the loudest tell of art assembled from
   parts: the bow's pixels were 50% bigger than the sword's. */
export const DENSITY = 37.5;              // sprite pixels per tile
const tilesFor = rows => rows.length / DENSITY;

const blank = (w, h) => Array.from({ length: h }, () => Array(w).fill('.'));
const put = (g, r, xs, cols) => xs.forEach((x, i) => { g[r][x] = cols[i] });

/* Trace only the OUTSIDE edge.

   Outlining every empty neighbour also fills any HOLE in the sprite — that turned
   the bow's opening into a solid block and it read as a bucket. Flood-fill from
   the border first, and only outline against genuinely exterior space. */
function outlineExterior(g){
  const h = g.length, w = g[0].length;
  const out = Array.from({ length: h }, () => Array(w).fill(false));
  const q = [];
  const push = (r, x) => {
    if(r < 0 || x < 0 || r >= h || x >= w) return;
    if(g[r][x] !== '.' || out[r][x]) return;
    out[r][x] = true; q.push([r, x]);
  };
  for(let x = 0; x < w; x++){ push(0, x); push(h - 1, x) }
  for(let r = 0; r < h; r++){ push(r, 0); push(r, w - 1) }
  for(let i = 0; i < q.length; i++){
    const [r, x] = q[i];
    push(r + 1, x); push(r - 1, x); push(r, x + 1); push(r, x - 1);
  }
  const edge = [];
  for(let r = 0; r < h; r++) for(let x = 0; x < w; x++){
    if(g[r][x] === '.') continue;
    for(const [dr, dx] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const rr = r + dr, xx = x + dx;
      if(rr >= 0 && xx >= 0 && rr < h && xx < w && g[rr][xx] === '.' && out[rr][xx])
        edge.push([rr, xx]);
    }
  }
  for(const [r, x] of edge) g[r][x] = 'K';
  return g;
}

const rows = g => g.map(r => r.join(''));

/* ── wooden sword 13x30
   Three steps to a point. Wood does not hold an edge, so the taper is short and
   the tip is stepped rather than needled. Grain runs WITH the blade in a few
   long streaks — per-pixel noise reads as dirt, not timber. */
function sword(){
  const g = blank(13, 30);
  for(let r = 1; r < 4; r++)  put(g, r, [6], ['M']);
  for(let r = 4; r < 7; r++)  put(g, r, [5,6,7], ['L','M','D']);
  for(let r = 7; r < 20; r++) put(g, r, [4,5,6,7,8], ['L','L','M','M','D']);

  for(let r = 8;  r < 12; r++) g[r][6] = 'D';
  for(let r = 15; r < 19; r++) g[r][6] = 'D';
  for(let r = 9;  r < 12; r++) g[r][5] = 'H';
  for(let r = 13; r < 15; r++) g[r][4] = 'H';
  for(let r = 16; r < 18; r++) g[r][7] = 'D';

  for(let x = 1; x < 12; x++){ g[20][x] = 'L'; g[21][x] = 'M'; g[22][x] = 'D' }
  for(const x of [1, 11]){ g[20][x] = 'M'; g[21][x] = 'D' }

  [23,24,25,26].forEach((r, i) =>
    put(g, r, [5,6,7], i % 2 === 0 ? ['M','L','M'] : ['D','M','D']));
  put(g, 27, [4,5,6,7,8], ['M','L','L','L','M']);
  put(g, 28, [4,5,6,7,8], ['D','D','M','D','D']);
  const r_ = rows(outlineExterior(g));
  return { rows: r_, grip: [6, 24], tiles: tilesFor(r_), material: 'wood' };
}

/* ── wooden dagger 11x19
   The sword's language, shorter, and the pommel dropped. A dagger that is just
   a short sword reads as a broken sword. */
function dagger(){
  const g = blank(11, 19);
  for(let r = 1; r < 3; r++)  put(g, r, [5], ['M']);
  for(let r = 3; r < 5; r++)  put(g, r, [4,5,6], ['L','M','D']);
  for(let r = 5; r < 12; r++) put(g, r, [3,4,5,6,7], ['L','L','M','M','D']);
  for(let r = 6;  r < 9;  r++) g[r][5] = 'D';
  for(let r = 9;  r < 11; r++) g[r][4] = 'H';
  for(let x = 2; x < 9; x++){ g[12][x] = 'L'; g[13][x] = 'D' }
  [14,15,16,17].forEach((r, i) =>
    put(g, r, [4,5,6], i % 2 === 0 ? ['M','L','M'] : ['D','M','D']));
  const r_ = rows(outlineExterior(g));
  return { rows: r_, grip: [5, 16], tiles: tilesFor(r_), material: 'wood' };
}

/* ── wooden shield 13x16
   Board shield seen face-on. Edge-on is the honest top-down reading but
   collapses to a line at tile size. Two plank seams and one bound rim: three
   was noise. */
function shield(){
  const g = blank(13, 16);
  const hw = r => r < 1 ? 3 : r < 9 ? 5 : r < 11 ? 4 : r < 13 ? 3 : 1;
  for(let r = 0; r < 14; r++){
    const w = hw(r);
    for(let x = 6 - w; x <= 6 + w; x++){
      const off = x - (6 - w);
      g[r][x] = off < 2 ? 'L' : (off > 2*w - 2 ? 'D' : 'M');
    }
  }
  for(let r = 0; r < 14; r++) for(const x of [4, 8]) if(g[r][x] !== '.') g[r][x] = 'D';
  for(let x = 1; x < 12; x++) if(g[7][x] !== '.') g[7][x] = 'D';
  for(const [r, xs] of [[5,[5,6,7]],[6,[5,6,7]],[7,[5,6,7]]])
    for(const x of xs) g[r][x] = 'D';
  g[5][6] = 'H'; g[6][5] = 'L'; g[6][6] = 'L'; g[6][7] = 'M';
  const r_ = rows(outlineExterior(g));
  return { rows: r_, grip: [6, 8], tiles: tilesFor(r_), material: 'wood' };
}

/* ── wooden bow 15x11
   A strung arc: limbs bow away from the wearer, string chords the tips. The
   interior stays OPEN, which is the whole reason outlineExterior exists. */
function bow(){
  const g = blank(21, 15);
  const arc = { 0:[9,11], 1:[7,13], 2:[6,14], 3:[5,15], 4:[4,16],
                5:[3,17], 6:[2,18], 7:[1,19], 8:[1,19], 9:[1,19], 10:[1,19] };
  for(const [rs, [a, c]] of Object.entries(arc)){
    const r = +rs;
    if(r === 0){ for(let x = a; x <= c; x++) g[r][x] = 'M' }
    else { g[r][a] = 'L'; g[r][c] = 'M' }
  }
  for(let r = 1; r <= 3; r++){ g[r][arc[r][0]+1] = 'L'; g[r][arc[r][1]-1] = 'M' }
  g[0][10] = 'H';
  for(const r of [7,8,9,10]){ g[r][1] = 'M'; g[r][19] = 'D' }
  g[11][1] = 'D'; g[11][19] = 'D';                  // nocks
  for(let x = 2; x < 19; x++) g[11][x] = 'C';       // string chords the tips
  for(const r of [1,2,3]) g[r][10] = 'D';           // bound riser
  const r_ = rows(outlineExterior(g));
  return { rows: r_, grip: [10, 3], tiles: tilesFor(r_), material: 'wood' };
}

export const MATERIALS = {
  wood: {
    K: '#2A1A0F',   // outline
    D: '#7A5632',   // grain, shadow, bindings
    M: '#A87C4A',   // body
    L: '#C9A06A',   // lit face
    H: '#DCB782',   // highlight
    C: '#D9CCB2',   // sinew: bowstring, lashing
  },
};

export const build = () => ({
  sword:  sword(),
  dagger: dagger(),
  shield: shield(),
  bow:    bow(),
});

/* Which item uses which sprite. Both daggers share one. */
export const GEAR_ART = {
  sword:   'sword',
  shield:  'shield',
  bow:     'bow',
  daggerL: 'dagger',
  daggerR: 'dagger',
};
