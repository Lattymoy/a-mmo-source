# Equipment

**Status:** `STATED` — glyphs · `BUILT` in [[Architecture]]

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

**Status:** `STATED` — two daggers, a dual-wield pair. `<` off hand, `>` main hand.

## How equipped gear reads

**Status:** `STATED`

```
c○/     shield and sword
 ○}     bow
<○>     paired daggers
```

**Gear is carried in the hands.** The off hand holds the shield, the main hand
the weapon, and both ride the floating nubs described in
[[Character Presentation]].

That means gear inherits the nubs' float, lag and side confinement for free: a
weapon can never end up behind the wearer, on the wrong side of them, or clashed
into the other hand. Glyphs rotate with facing, so the `c○/` reading holds in
every direction — it is **body-relative, not screen-relative**. Face south and
the shield appears on screen-right, because it is still on the character's own
left.

The ring keeps its full 0.40 radius now that nothing crowds its sides, so the
level digit gets all its room back — the earlier shrink to 0.28 is gone.

The bow is two-handed: equipping it clears the off hand, and equipping anything
off-hand clears it. It currently draws in the main hand only; a two-hander
spanning both nubs is not built.

A hand shows **either a nub or what it holds, never both** — at thumb tile size
a glyph and a dot in the same place is mush.

## Stats

**Status:** `STATED` — weapons increase Attack, a shield increases Defense.

Base attack is 3 so an unarmed player still hits. Values below are tuning, not
design:

| Item | Slot | Effect |
| --- | --- | --- |
| sword `/` | main | +3 atk |
| bow `}` | main, two-hand | +3 atk |
| dagger `>` | main | +2 atk |
| dagger `<` | off | +2 atk |
| shield `c` | off | +2 def |

Defense subtracts from incoming damage with a floor of 1, and the log says how
much was blocked. Paired daggers total +4 attack against a sword's +3 — the pair
out-damages the single blade and gives up all defense. Nothing yet makes that a
real trade, because tick cost does not vary by weapon. See [[Open Questions]].

## Sprites

**Status:** `STATED` — reference supplied by Mac. `BUILT` 2026-08-22: wooden
sword, shield, dagger and bow.

**Gear is pixel art, in the hand and on the ground alike.** At a thumb-sized
tile a vector curve turns to mush; a pixel grid stays crisp and is authored by
eye. The first pass was drawn with beziers and was replaced outright.

Sprites are grids of palette **letters**, not colours, so one sprite renders in
any material. Colour comes from the material because progression is material
driven — bosses drop material, material builds weaponry ([[Progression]]). Only
`wood` exists; no tier above it is invented.

Each sprite declares a **grip**: the pixel the hand actually holds, so a sword
hangs from its handle rather than its middle and a bow from its riser. Items
with no sprite fall back to their map glyph, so adding art is additive.

### Clearance is a construction rule, not a size

Every sprite reaches BACKWARD from its grip, and the hand sits at a measured gap
from the ring. The bow is the worst case: it is two-handed, held between the
hands, and its riser sits well forward of its string, so it reaches 0.36 tiles
back.

Rather than shrink sprites until they happen to fit, the **anchor is pushed out**
until the sprite clears (`clearAnchor`). True at any pace, facing, or hand
position. Tested against an anchor placed exactly on the body — far worse than
anything the hands can produce.

### On the ground

Dropped gear draws as its sprite, lying at an angle derived from the tile index:
deterministic so it never flickers between frames, varied so a floor of loot
does not look like a rack. Only in direct view — remembered tiles stay glyphs,
because memory is not detail.

### Two-handers

A two-hander is drawn once **between** the hands rather than in one of them, and
occupies both, so neither shows a nub.

## Prototype state

Gear scatters on open floor and is picked up with the same `gather` verb as
flora. Equipment screen opens from `gear` in the top bar: two slots, live
ATK/DEF, tap an item to equip, tap again to remove.

Related: [[Player Representation]] · [[Combat Presentation]] · [[Progression]] · [[Biomes]]

Related: [[Player Representation]] · [[Progression]] · [[Biomes]]
