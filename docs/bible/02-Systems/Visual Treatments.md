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
