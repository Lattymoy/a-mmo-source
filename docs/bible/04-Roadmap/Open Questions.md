# Open Questions

**Status:** `OPEN` — asked, not answered. Do not resolve these by assumption.

## Asked in conversation, unanswered

1. **Session length.** Five minutes at a bus stop, or a persistent world you drop
   into for an hour?
2. **Camera.** Tight and dungeon-like, or zoomable overworld? Both are stubbed in
   [[Visual Treatments]]; neither is chosen.
3. **Next pass.** Visuals — more themes, lighting, glyph weight. Or input — drag-path
   preview, hold-to-inspect, ability targeting shapes.

## Stated pillars with no system behind them

4. **Upgrade vs. refine vs. build.** Three verbs stated in [[Progression]], no
   distinction defined between them.
5. **Scavenge flora.** Gathering works. Boss material is now the stated source of
   gear, so what flora feeds is unresolved — second material track, consumables,
   or vestigial.
6. **Party size.** Missions are solo or matchmade ([[World Structure]]). The
   matchmade party size is not stated.
7. **Hub as shared space.** The hub is where "the shared world begins" — whether
   players see each other in it, and how many, is not stated.
8. **Desktop input.** Whether desktop mirrors the tap grammar or gains keyboard
   movement, and whether the lit-tile arming set survives on a platform that has
   hover. See [[Platforms]].
9. **Two hubs.** project-raum already has a hub — a single-player campsite,
   marked COMPLETE. This project's hub is shared, with vendors and quests. Same
   place, different place, or different era is not stated. See [[Raum]].
10. **Two-digit legibility.** The condense call in [[Player Representation]] is
    built but not looked at on a real phone. Find the level where it stops
    reading.
11. **Weapon tick cost.** Weapons change Attack only. Nothing makes a heavy
    weapon slower or a dagger faster, so paired daggers strictly beat a sword on
    damage and the choice is not a trade. The [[Tick Scheduler]] was built to
    carry exactly this. Not stated — do not assume it.
12. **The heavy enemy.** Only the base `□` husk is stated. Whether larger
    enemies exist below boss scale, and what they look like, is not.
13. **Cape weight on screen.** ~1.5 tiles of cloth per player. Untested with a
    full party in view — see [[Character Presentation]].
14. **What levelling does.** Max 25 is stated. What a level grants — stats,
    ability slots, gear tier access — is not.
15. **Band vs. zone.** Raum's three bands are distance-banded in project-raum.
    This game has missions into procedural zones ([[World Structure]]). Whether a
    zone is a band, sits inside one, or is unrelated is not stated. The
    [[Biomes]] palettes borrow band names for demonstration only.
16. **Zone generation.** "Procedural zone-based areas" is stated. What varies
   between zones — biome, layout, hazard, boss — is not.

## Resolved since

- **Co-op scale** is now bounded: hub-and-instance with matchmade missions, not a
  persistent shared field. See [[World Structure]].
- **Where gear comes from** is boss material. See [[Progression]].
- **Boss framing on mobile** — the viewport enlarges. See [[Platforms]].
- **Weapons vs. hands** — gear is carried in the hands, body-relative. See
  [[Equipment]].
- **Gear art** — pixel sprites, held and on the ground. Glyphs remain only for
  remembered (out-of-view) tiles and for items with no sprite yet.
- **Platforms** — desktop and mobile, not mobile-only.

## Standing call

**Second actor next.** It is the one test that can invalidate the input model,
and everything downstream is wasted work if the model does not hold. Cheap to
fake: a second `@` on the same scheduler with simple AI, then watch whether the
pacing survives someone else acting between your steps.

Related: [[Premise]] · [[Architecture]]
