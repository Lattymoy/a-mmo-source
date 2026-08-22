# Player Representation

**Status:** `STATED`

The player is represented as **a number**. The number visualizes their character
sprite and their level.

**Max level is 25 in the base game.**

## Consequence: digits are reserved

**Status:** `PROPOSED` — reading of the above

If players are numbers, then `0`–`9` belong to players and nothing else. No
monster, item, terrain feature, or effect may use a digit as its glyph.

That is a hard namespace rule and it is cheap to hold now, expensive later.
Monsters stay letters (`k`, `r`, `T` in [[tap-grid]]).

## Consequence: level is public

**Status:** `PROPOSED`

Everyone's level is legible at a glance, with no inspect step. In a hub full of
players ([[World Structure]]) the crowd reads as a scatter of numbers — you can
see the shape of the population before you talk to anyone.

For matchmade missions this is free social information that would otherwise need
UI.

## The two-digit problem

**Status:** `BUILT` — solved one way in [[tap-grid]], needs a look

Levels 10–25 are two characters in a one-character cell.

Three ways out:

1. **Condense.** Two narrow digits share the tile.
2. **Alphanumeric.** `1`–`9` then `A`–`P` for 10–25. Rejected: it destroys the
   point. "25" reads instantly as a level; "P" does not.
3. **Double-width cell** for the player. Rejected on sight: it breaks grid
   alignment and the tap target.

**Call: condense.** Implemented in [[tap-grid]] — the player glyph draws at 0.62×
horizontal scale when the level reaches two digits.

Whether that survives at mobile thumb-tile size is a *look at it* question, not
an argue-about-it question. `tap-grid.html` has an `lvl+` control in the top bar
that cycles 1→25 so the failure point can be found by eye.

Related: [[Visual Treatments]] · [[Platforms]] · [[Open Questions]]
