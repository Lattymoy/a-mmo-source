# Equipment

**Status:** `STATED` — glyphs · `BUILT` in [[tap-grid]]

| Glyph | Item |
| --- | --- |
| `/` | sword |
| `c` | shield |
| `}` | bow and arrow |
| `<` `>` | daggers |

## Reading of the set

**Status:** `PROPOSED`

The glyphs describe **shape**, not category — a sword is a blade at an angle, a
shield is a curve, a bow is a drawn stave. That is a different logic from
roguelike convention, where `/` is any wand and `(` is any weapon. It means the
set stays legible without a legend, and it means new gear has to earn a glyph
that looks like itself.

Consequence: the glyph space is small. There are only so many characters that
read as a physical object. Gear variety will have to live in **material and
colour** rather than in new glyphs — which suits the material-driven progression
in [[Progression]], where a weapon is defined by what it was built from.

## Gear takes theme colour, never biome

**Status:** `BUILT`

Gear is manufactured, so it follows the same rule as entities in [[Biomes]]: its
colour comes from the treatment, not from the zone. A sword must not turn
violet because you carried it into a corrupted region — you would lose the
ability to spot it on the floor.

Flora keeps the biome tint. It grew there.

## Daggers

**Status:** `OPEN`

`<` and `>` are both stated as daggers. Whether that is one item with two
orientations, a dual-wield pair, or two distinct daggers is not stated.
[[tap-grid]] carries them as two entries so the question stays visible rather
than being silently resolved.

## Prototype state

Gear scatters on open floor and is picked up with the same `gather` verb as
flora — verified, all eight ground kinds spawn, target, and land in inventory.
Nothing is equippable yet, and gear has no stats.

Related: [[Player Representation]] · [[Progression]] · [[Biomes]]
