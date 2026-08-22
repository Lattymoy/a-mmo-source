# Character Presentation

**Status:** `STATED` · `BUILT` 2026-08-22

Stated:

- `○` is the primary character sprite.
- The **prime visual equipment is a flowing cape that follows behind.**
- Idle breathing.
- Movement animation between tiles.

## The cape

A verlet chain of 8 nodes hanging off the shoulders, integrated **in real time,
not on the tick**. That distinction is the point: the cape keeps flowing while
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

### Two rendering bugs worth remembering

- **Faceted edges read as folded card.** Straight lines between eight nodes look
  like origami. Quadratics through the segment midpoints read as cloth.
- **The return edge must connect.** Starting it with `moveTo` split the shape
  into two subpaths, and the cape filled as two hollow crescents with a gap down
  the middle. It looked like a leaf.
- **A cape that tapers to a point reads as a flame.** It closes to a hem at 16%
  of shoulder width, not to nothing.

### Colour

`cape` is its own slot in the theme, separate from `you` and `gear`. Like both,
it takes the treatment's colour and **never the biome tint** — see [[Biomes]].
This is the natural home for faction or material colour once either exists.

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

The cape is roughly 1.5 tiles long on an 11-column screen, so it overlaps
neighbouring tiles. That is deliberate — cloth that fits inside one cell is not
flowing — but it is the thing most likely to be judged too heavy once other
players are on screen. Flag it if a party of four reads as clutter.

Related: [[Player Representation]] · [[Combat Presentation]] · [[Visual Treatments]]
