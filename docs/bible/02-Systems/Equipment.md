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

## Prototype state

Gear scatters on open floor and is picked up with the same `gather` verb as
flora. Equipment screen opens from `gear` in the top bar: two slots, live
ATK/DEF, tap an item to equip, tap again to remove.

Related: [[Player Representation]] · [[Combat Presentation]] · [[Progression]] · [[Biomes]]

Related: [[Player Representation]] · [[Progression]] · [[Biomes]]
