# Character Presentation

**Status:** `STATED` · `BUILT` 2026-08-22 · rebuilt as pixel art from Mac's
reference the same day.

## The avatar is pixel art

Reference supplied by Mac: a shaded white sphere for the body, two grey sphere
nubs for hands, and a red pleated cape with a collar and a heavy black keyline.

The hard part is that **the cape has to keep flowing**. It is a live verlet sim,
not a pose, so it cannot be authored as sprite frames without losing the
physics. Drawing it with canvas paths gives soft antialiased edges that read as
vector art sitting next to the pixel gear.

So the whole avatar is drawn into a **small offscreen buffer at the game's pixel
density, quantized to a fixed palette with hard alpha, then blitted up with
smoothing off**. Anything drawn into that buffer becomes pixel art — including
geometry that changes every frame. The cape still simulates; it just resolves to
hard pixels.

Quantization is not optional: canvas antialiases every path, so the low-res
buffer alone gives blurry pixel art. Snapping alpha to 0/255 and clamping every
colour to the palette is what makes it flat and hard-edged.

### The buffer must blit at a whole-number upscale

This is what decides whether the avatar reads as pixel art at all.

Running the buffer at the gear sprites' density (37.5 px/tile) against a ~35px
tile meant the avatar was **downscaled** on blit. Nearest-neighbour downscaling
drops pixels irregularly: stair-steps break up and the result reads as noise no
matter how carefully the shapes are drawn. The cape looked like flat vector
shading because, effectively, it was being resampled into one.

The avatar now picks a buffer resolution that divides the tile evenly and blits
at exactly that integer scale, so every art pixel is exactly N screen pixels.
Gated across a range of tile sizes.

**Trade, recorded deliberately:** avatar pixels are now about twice the size of
gear-sprite pixels. Gear was left untouched. Matching them would mean redrawing
every weapon at half its pixel dimensions, which is a separate decision.

Gear sprites still share one density **among themselves** — a test caught the
bow drawn at 25 px/tile against the sword's 37.5, and it was redrawn larger
rather than scaled. Sprite size in the world is a consequence of pixel count,
never of a scale factor.

### The cape is a trapezoid, not a mantle

**Status:** `STATED` — iterated against Mac's reference.

The first pixel cape fanned sideways: ribs anchored across a wide arc and
splayed, which opened gaps between pleats so it read as separate tongues of
cloth rather than one garment.

A cape is **gathered narrow at the collar and widens as it falls**. That is a
combination of two dials, not one:

- `SPREAD` — how wide the ribs are pinned. Narrow.
- `SPILL` — how strongly ribs are pulled parallel. Low enough that they fan
  outward as they descend, high enough that the outer ones do not flare into
  wings.

Rib length tapers from the centre out, so the hem comes to a point rather than
cutting straight across.

### Pleats need hard steps and a notched hem

Four tones stepped hard, not blended — at this pixel density a gentle gradient
quantizes to one flat colour and the folds disappear entirely. Black creases run
down every internal rib; without them the tones abut and the cape reads as a
colour ramp instead of separate folds.

The hem **notches** between pleats: each rib tip is a point and the gap cuts
back toward the collar. A hem running tip to tip reads as a cut-out.

**The notch is a fixed distance, not a fraction of length.** Scaling it meant a
long cape got a proportionally enormous notch, every pleat became a spike, and
the whole thing read as flames.

### The player's palette is fixed

The avatar takes neither the theme nor the biome tint. It looks identical under
every treatment and in every zone, because the one thing you must always find
instantly on screen is yourself. See [[Biomes]].

### The level rides on top

The level digit is drawn **at full resolution over** the avatar, not inside the
buffer. At 37.5 px/tile a two-digit number would be about six pixels tall and
unreadable, and the level is the one thing that must never be illegible. It is
outlined in the avatar's keyline colour so it holds against the lit face of the
sphere.

Stated:

- `○` is the primary character sprite.
- The **prime visual equipment is a flowing cape that follows behind.**
- Idle breathing.
- Movement animation between tiles.

## The cape

**A mantle, not a tail.** Reference supplied by Mac: a top-down figure whose
cape anchors across the shoulders, wraps around the body, spreads wider than the
wearer, and ends in a scalloped hem of distinct lobes.

Built as **ribs** — seven short verlet chains fanned across the back. Ribs are
what make it cloth rather than a pennant: the hem's lobes fall out of the rib
tips for free, and the same ribs double as interior fold lines when shaded.
The first attempt was a single chain tapering to a point, which could only ever
be a tail.

Integrated **in real time, not on the tick**. That distinction is the point: the cape keeps flowing while
the clock is held waiting for input, so a player standing still deciding their
next tap is still alive on screen. In a turn-based game where time stops
constantly, this is what stops the world looking frozen.

Physics runs in **tile units, not pixels**, so the cloth behaves identically at
every camera zoom and on every screen size — including the enlarged boss
viewport in [[Platforms]].

Facing comes from actual motion rather than a stored direction, so a dash throws
the cloth correctly for free, and a lunge whips it without any attack-specific
code.

### Length alone does not hold cloth up

First build used segment-length constraints plus a spring toward a rest pose.
It **folded back and piled onto the wearer**, covering the level digit — the one
thing that must never be obscured ([[Player Representation]]).

Fix is angular: each joint is limited to 0.42 rad of bend from the one before
it, solved shoulders-outward. The cloth can flow and curl but cannot collapse
onto the body. There is now a test that jitters direction every frame for 1200
frames and asserts no node ever enters the ring.

### What makes it read as a cape and not a decal

- **The shoulder arc must sit at the body's edge, not inside it.** Anchored at
  0.30 tiles against a 0.40 ring, the whole fan hid under the body and only the
  tips showed — it looked like a fringe.
- **The hem is a spline, not line segments.** Straight edges meeting at rib tips
  make hard points, and pulling the hem inward between tips carves notches
  between them. Together they read unmistakably as a **bat wing**. The outline
  is now one closed Catmull-Rom loop walked around the whole cloth, so no edge
  anywhere has a corner.
- **Undulation comes from the ribs, not from carving.** A perfectly smooth
  spline over evenly-spaced tips reads as a scallop shell. Alternate ribs run
  ~13% short, and the spline turns that into soft curls — waves with no
  corners.
- **A heavy dark keyline underneath everything.** Taken from the reference; it
  is what lifts the cloth off dark terrain.
- **Interior fold lines.** Flat colour reads as a sticker no matter how good the
  silhouette is.
- **The body is filled, not just stroked.** The cape passes behind it, and a
  hollow ring let cloth show through the level digit.

### Two rendering bugs worth remembering

- **Faceted edges read as folded card.** Straight lines between eight nodes look
  like origami. Quadratics through the segment midpoints read as cloth.
- **The return edge must connect.** Starting it with `moveTo` split the shape
  into two subpaths, and the cape filled as two hollow crescents with a gap down
  the middle. It looked like a leaf.
- **A cape that tapers to a point reads as a flame.** Superseded by the ribbed
  hem, but the lesson stands for any future cloth.

### Colour

`cape` is its own slot in the theme, separate from `you` and `gear`. Like both,
it takes the treatment's colour and **never the biome tint** — see [[Biomes]].
This is the natural home for faction or material colour once either exists.

## The hands

**Status:** `STATED` — two little floating circles in front of the character,
nubs standing in for left and right hands.

**They are not attached to the body.** Each nub is its own spring-damped body
chasing a target point, so it lags when the character sets off, overshoots when
they stop, and floats on its own idle cycle at a different rate and phase from
its partner. Pinned at a fixed offset they read as painted-on dots; floating,
they read as separate things travelling with the character.

The target sits 0.66 tiles ahead of centre and 0.40 to either side, and the two
**swing in opposition through a step** — one leads while the other trails. That
opposition is what makes a walk read as a walk rather than a slide.

Free-floating needs bounds at both ends. The nubs are held in a **shell**: a
leash at 0.88 tiles so a dash cannot strand them across the room, and an inner
floor so they can never reach the body. Anywhere between, they float untouched.

### Lag sideways, never backward

**Status:** `STATED` — the hands must not move behind the character when moving.

A spring alone drags the nubs backward past the wearer every time they set off,
which reads as the character towing two balloons — and puts the hands on the
same side as the cape, destroying the facing signal both exist to give.

Solved in **facing space** rather than world space: the nub's offset is split
into how far ahead it is and how far to the side, and the forward component is
floored at 0.30 tiles. The lag is kept in full; it just runs lateral and radial
instead of backward. The shell clamps are applied in the same space so the two
constraints cannot fight each other.

Gated on every frame of motion, not just at rest.

### Each hand keeps to its own side

**Status:** `STATED` — the hands must not clash into each other when turning.

Turning sweeps both targets across the body, and world-space springs follow them
straight through one another. Measured on the pre-fix build: the two nubs
overlapped completely (separation 0.000) on 375 frames of a spin.

A mutual-repulsion nudge would fight the spring. Instead the bound is
**per-component in facing space**: `fwd` is clamped so a nub never falls behind,
and `lat` is clamped **to its own side of the centreline**, so crossing is
impossible by construction rather than by tuning. A single radius clamp cannot
express "own side", which is why the earlier shell let this through.

The lag survives in full — it just runs within these bounds.

**The gap in the suite was that nothing ever turned.** Every hand check walked
in a straight line. There are now spin and zigzag cases asserting, on every
frame, that the nubs keep clear air between them and never cross the centreline.
Both fail loudly against the old code.

### The gap is a budget, not a number

First pass left 0.02 tiles between nub and ring — technically not overlapping,
visually welded on, and the heavy keylines on both shapes closed even that.
The inner floor is now derived rather than guessed:

```
HAND_MIN = BODY_R + KEYLINE + HAND_GAP + HAND_R
```

`HAND_GAP` is the clear space the eye should actually see (0.13 tiles); the same
budget, doubled, is what the two nubs must keep clear of **each other** — they
have to read as a pair, not as one blob under the body;
`KEYLINE` accounts for the stroke bleeding off both edges. Change the ring's
size or its stroke and the nubs move out to suit, with no re-tuning.

The suite measures the gap **edge to edge with keylines subtracted** — what the
eye sees, not what the centres say — and asserts it holds on every frame of
motion, not just at rest.

Together with the cape they do the real work: **hands lead, cloth trails**, so
the character's facing is unmistakable from the silhouette alone, with no sprite
rotation and no directional art. Gated by a test asserting the hands sit forward
of centre and the cape's tip sits behind it.

The target geometry is a pure function (`handTargets`) kept separate from the
simulation, so these are assertions rather than opinions: both hands forward,
both clear of the ring at every level width, never overlapping each other,
always opposing the cape, always inside the shell, and — the point of the whole
rework — measurably **lagging** the body rather than welded to it, while still
settling rather than jittering forever. A correlation test asserts the two nubs
never move as one rigid pair.

### Gear rides the hands

**Status:** `STATED` — resolved. Sword and shield are positioned in the hands.

Previously gear drew at fixed offsets from the ring while the hands rotated with
facing, so walking north put the sword on the east side. Now the weapon and
shield are drawn **at the nub positions**, and every constraint the nubs carry
applies to them at no extra cost: gear cannot fall behind the wearer, cross to
the wrong side, or clash with the other hand.

Held glyphs rotate with facing and swing with the attack, so the stated `c○/`
layout is preserved as a **body-relative** arrangement. Gated by a test that
walks the character through a full circle of facings and asserts the off hand
stays left and the main hand right at every one.

See [[Equipment]].

## Idle breathing

Ring radius and cape width scale on a slow sine, ±4.5%, phase-offset per wearer
by position so a crowd in the hub never pulses in unison.

Deliberately out of step with the arm-state pulse (880ms against 260ms) so the
two never read as the same signal — one means "you are alive", the other means
"this ability is armed".

## Movement

During a step the body **leans back and rises** — weight shifts opposite to
travel, peaking mid-step and settling on landing. Small numbers (5% and 6% of a
tile); at this scale anything larger reads as a glitch rather than a gait.

## Open

The mantle spans a little over one tile and overlaps its neighbours. Deliberate
— cloth confined to one cell is not flowing — but it is the thing most likely to
read as clutter once a full party is on screen.

The reference also carries a clasp, hood shading and limbs. None of that is
built: this is the cape's silhouette and motion only.

Related: [[Player Representation]] · [[Combat Presentation]] · [[Visual Treatments]]
