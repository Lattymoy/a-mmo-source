/* GEAR SPRITES

   Gear stops being a glyph the moment it is held. On the ground a sword stays
   `/` — the map is a glyph language and has to stay scannable — but in the hand
   it is drawn geometry, the same step the walls took.

   Sprites are defined in TILE units in a local space where the weapon points
   along -Y ("up"). The caller has already translated to the hand and rotated to
   the wearer's facing, so a sprite never needs to know which way anything is
   pointing.

   Colour comes from the MATERIAL, not from the theme. Progression is material
   driven — bosses drop material, material builds weaponry — so a weapon has to
   be able to say what it is made of at a glance, before any stat is read. */

export const MATERIALS = {
  wood: {
    light: '#C9A06A',   // planed face catching light
    mid:   '#A87C4A',   // body
    dark:  '#7A5632',   // grain and shadow
    bound: '#5A4028',   // grip wrap, pommel
  },
};

/* Rear reach matters: the grip and pommel extend BACKWARD from the hand, and
   the hand already sits at a measured gap from the body. A long tang would
   quietly close that gap and put the pommel on the level digit. */
export const SWORD = {
  tip:    -0.46,   // blade point, tiles ahead of the grip hand
  guard:   0.03,   // crossguard
  pommel:  0.17,   // furthest point BEHIND the hand
  span:    0.22,   // crossguard width
};

function woodenSword(ctx, TS, bg){
  const M = MATERIALS.wood;
  const U = v => v * TS;
  const key = (w) => { ctx.lineWidth = Math.max(1.6, TS * w); ctx.strokeStyle = bg;
                       ctx.lineJoin = 'round'; ctx.lineCap = 'round' };

  // ── blade: a tapered leaf, flat-tipped rather than needle-sharp. Wood does
  //    not hold a point, and the flat tip is what says "training weapon".
  const blade = () => {
    ctx.beginPath();
    ctx.moveTo(U(-0.050), U(SWORD.guard));
    ctx.lineTo(U(-0.038), U(SWORD.tip + 0.06));
    ctx.quadraticCurveTo(U(-0.028), U(SWORD.tip), U(0), U(SWORD.tip));
    ctx.quadraticCurveTo(U(0.028), U(SWORD.tip), U(0.038), U(SWORD.tip + 0.06));
    ctx.lineTo(U(0.050), U(SWORD.guard));
    ctx.closePath();
  };
  key(0.055); blade(); ctx.stroke();
  ctx.fillStyle = M.mid; blade(); ctx.fill();

  // lit edge down one side, so the blade reads as a solid object not a stick
  ctx.beginPath();
  ctx.moveTo(U(-0.030), U(SWORD.guard - 0.02));
  ctx.lineTo(U(-0.022), U(SWORD.tip + 0.08));
  ctx.strokeStyle = M.light;
  ctx.lineWidth = Math.max(1, TS * 0.022);
  ctx.stroke();

  // grain: one long line, off-centre. Two would read as a fuller.
  ctx.beginPath();
  ctx.moveTo(U(0.012), U(SWORD.guard - 0.04));
  ctx.lineTo(U(0.006), U(SWORD.tip + 0.12));
  ctx.strokeStyle = M.dark;
  ctx.lineWidth = Math.max(0.8, TS * 0.014);
  ctx.stroke();

  // ── crossguard
  const guard = () => {
    ctx.beginPath();
    ctx.moveTo(U(-SWORD.span/2), U(SWORD.guard + 0.012));
    ctx.lineTo(U(-SWORD.span/2), U(SWORD.guard - 0.028));
    ctx.lineTo(U( SWORD.span/2), U(SWORD.guard - 0.028));
    ctx.lineTo(U( SWORD.span/2), U(SWORD.guard + 0.012));
    ctx.closePath();
  };
  key(0.055); guard(); ctx.stroke();
  ctx.fillStyle = M.dark; guard(); ctx.fill();

  // ── grip, bound
  const grip = () => {
    ctx.beginPath();
    ctx.moveTo(U(-0.032), U(SWORD.guard + 0.01));
    ctx.lineTo(U(-0.028), U(SWORD.pommel - 0.03));
    ctx.lineTo(U( 0.028), U(SWORD.pommel - 0.03));
    ctx.lineTo(U( 0.032), U(SWORD.guard + 0.01));
    ctx.closePath();
  };
  key(0.055); grip(); ctx.stroke();
  ctx.fillStyle = M.bound; grip(); ctx.fill();

  // ── pommel
  ctx.beginPath();
  ctx.arc(0, U(SWORD.pommel - 0.03), U(0.045), 0, Math.PI * 2);
  key(0.05); ctx.stroke();
  ctx.fillStyle = M.dark; ctx.fill();
}

/* Registry. Gear with no entry falls back to its glyph, so adding a sprite is
   additive and never breaks an item that has not been drawn yet. */
export const GEAR_ART = {
  sword: woodenSword,
};

export const hasArt = key => Object.prototype.hasOwnProperty.call(GEAR_ART, key);

export function drawGearArt(ctx, key, TS, bg){
  const fn = GEAR_ART[key];
  if(!fn) return false;
  ctx.save();
  fn(ctx, TS, bg);
  ctx.restore();
  return true;
}
