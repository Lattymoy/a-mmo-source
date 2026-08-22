# Character Presentation

**Status:** `STATED` · `BUILT` 2026-08-22

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

The target sits 0.44 tiles ahead of centre and 0.26 to either side, and the two
**swing in opposition through a step** — one leads while the other trails. That
opposition is what makes a walk read as a walk rather than a slide.

Free-floating needs bounds at both ends. The nubs are held in a **shell**: a
leash at 0.55 tiles so a dash cannot strand them across the room, and an inner
floor at 0.52 so idle drift cannot push one over the level digit. Anywhere
between, they float untouched.

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

### Conflict to resolve

Equipped weapons still render **fixed left and right of the ring** per the
stated `c○/` layout, while the hands rotate with facing. Walk north and your
sword is on the east side while your hands point north. Nothing is broken, but
a weapon should presumably be *in* a hand. Not changed, because the layout is
stated — see [[Open Questions]].

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
