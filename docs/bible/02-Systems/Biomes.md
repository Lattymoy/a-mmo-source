# Biomes

**Status:** `STATED`

**Biomes can be colour dictated.**

Same glyphs, same map language, a different palette. A biome is not a new tile
set — it is a recolour.

## Why this is strong

It is the cheapest possible content axis. Zone variety in
[[World Structure|procedural zone-based areas]] costs a palette, not art.

It is also already how Raum works. From project-raum, verified: zones are
distance-banded biomes, and each band swaps enemy set and palette. Palette
degrading per band is established world behaviour, not a new invention here.
See [[Raum]].

## Architectural split

**Status:** `BUILT` — in [[tap-grid]]

Colour-dictated biomes force a separation that did not exist before:

| Layer | Owns |
| --- | --- |
| **Theme** | Treatment — background, glyph choice, glow, cell fill, grid gutters, entity colour |
| **Biome** | Terrain palette — floor, wall, memory, cell, flora |

Theme is how the game is *drawn*. Biome is where you *are*. They compose: any
biome renders under any theme.

Consequence worth holding: **entity colour stays with the theme, not the biome.**
Monsters and players must not recolour per zone, or they stop being instantly
findable against the terrain.

## Prototype palettes

Named for Raum's three verified bands. This is a palette demonstration — it does
**not** claim band and zone are the same thing in this game. That mapping is
[[Open Questions|unstated]].

| Biome | Reading |
| --- | --- |
| `uncorrupt` | Living. Cool green over slate. |
| `corrupt` | Sickly. Violet with ochre flora. |
| `shaped` | Cold and crystalline. Blue-white. |
| `none` | Falls through to the theme's own palette. |

Related: [[Visual Treatments]] · [[World Structure]] · [[Raum]]
