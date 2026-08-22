# Visual Treatments

**Status:** `BUILT` — three readings of one simulation · obstacle treatment chosen

Mac stated the grid could be "maybe ASCII, or maybe just a simple black grid".
[[tap-grid]] ships three treatments behind a toggle so that choice can be made by
looking rather than arguing.

| Theme | Reading |
| --- | --- |
| `phosphor` | CRT bloom. Green-cyan glyphs, glow on entities, near-black field. |
| `bone` | Crisp and warm. Bone-white glyphs, rust monsters, no glow. |
| `board` | Filled cells with gutters. Reads as a physical game board, not a terminal. |

## Obstacles

**Status:** `STATED`

**The board treatment is Mac's preferred use of obstacles.** Walls as filled
cells (`▓`) with gutters, rather than as `#` floating on a dark field.

`board` is now the prototype default. The other two treatments stay for
comparison, not as candidates.

Note the split this creates with [[Biomes]]: `board` is a *treatment* choice.
Obstacle colour still comes from the biome.

### Walls are geometry

**Status:** `STATED` — obstacles should angle correctly to form geometry like walls.
`BUILT` 2026-08-22.

A wall tile touching open floor is a **face** — the surface you can see. Faces
connect to adjacent faces on four bits (N/E/S/W), so a chamber's contour draws
itself with real corners, tees and ends. Wall tiles with no floor around them
are **buried rock** and render recessive at 0.30 alpha.

**Faces are stroked, not lettered.** Box-drawing characters were tried first and
rejected on evidence: they only tile in a terminal, where the cell is about 0.6
as wide as it is tall. On a square grid at 0.78em the strokes never reach the
cell edge and the wall reads as dashes. Stroking centre-to-edge segments makes
adjacent faces join exactly on the shared edge.

Verified: 859 segments generated, 0 unmatched — every stroke toward a neighbour
is met by that neighbour's stroke back, so no contour can break.

This is the first place the project stops being literally ASCII. Glyphs still
carry floor, flora, monsters and players; walls are drawn. Flag if that split
becomes a problem.

## Signature: the arm hush

**Status:** `BUILT` — flagged for review

When an ability is armed the whole world drops to 18% opacity and only legal
tiles breathe. It makes the modal state unmissable.

Concern on record: it lands on the tenth arm. Unknown whether it survives the
two-hundredth.

## Camera

**Status:** `BUILT` · underlying question `OPEN`

Two modes: `close` at 11 columns, `tactical` at 25. Tactical accepts no input
except tap-to-return, so the wider view can never be mistaken for a play surface.

Constraint on record: a thumb needs roughly 9mm of tile, which puts a phone at
about 9×14 visible tiles. Whether the game is tight and dungeon-like or has a
zoomable overworld is [[Open Questions|unanswered]].

Related: [[Biomes]] · [[Tap Input]] · [[Platforms]]
