# Player Representation

**Status:** `STATED`

The player is represented as **a circle — `○` — with their level positioned
inside it.**

**Max level is 25 in the base game.**

The ring is the "this is a player" signal. The number it contains is the level.
Supersedes the earlier form where the bare digit was the glyph.

## Consequence: digits are reserved

**Status:** `PROPOSED` — reading of the above

If players are numbers, then `0`–`9` belong to players and nothing else. No
monster, item, terrain feature, or effect may use a digit as its glyph.

The ring softens this — containment now carries the signal, so a loose digit
elsewhere would not be mistaken for a player. Keep the rule anyway. It costs
nothing and it keeps the read unambiguous at small tile sizes, where the ring is
the first thing to blur.

Monsters stay letters (`k`, `r`, `T` in [[Architecture]]). Gear has its own glyph
set — see [[Equipment]].

## Consequence: level is public

**Status:** `PROPOSED`

Everyone's level is legible at a glance, with no inspect step. In a hub full of
players ([[World Structure]]) the crowd reads as a scatter of numbers — you can
see the shape of the population before you talk to anyone.

For matchmade missions this is free social information that would otherwise need
UI.

## The two-digit problem

**Status:** `BUILT` — solved one way in [[Architecture]], needs a look

Levels 10–25 are two characters in a one-character cell.

Three ways out:

1. **Condense.** Two narrow digits share the tile.
2. **Alphanumeric.** `1`–`9` then `A`–`P` for 10–25. Rejected: it destroys the
   point. "25" reads instantly as a level; "P" does not.
3. **Double-width cell** for the player. Rejected on sight: it breaks grid
   alignment and the tap target.

**Call: condense.** Implemented in [[Architecture]] — the level draws at 0.66×
horizontal scale inside the ring when it reaches two digits.

The ring makes this harder, not easier: the number now has to fit *inside* a
circle rather than fill the cell. Level sits at 0.44× tile against a ring at
0.40× radius. This is the thing most likely to fail on a real phone.

Whether that survives at mobile thumb-tile size is a *look at it* question, not
an argue-about-it question. `index.html` + `src/` has an `lvl+` control in the top bar
that cycles 1→25 so the failure point can be found by eye.

Related: [[Visual Treatments]] · [[Platforms]] · [[Open Questions]]
