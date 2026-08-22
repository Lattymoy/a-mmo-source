# tap-grid

**Status:** `BUILT` · `tap-grid.html`

First prototype. Single self-contained HTML file, no build step required to run
it — open the file or serve it. Built to develop **visuals and input**, on
request.

## What it contains

- Cellular-automata cave, 56×56, largest-region cull so every tile is reachable.
- Wall face/buried classification with stroked contours — see [[Visual Treatments]].
- Bresenham LOS field of view, radius 8, with explored-tile memory.
- Energy scheduler — see [[Tick Scheduler]].
- BFS pathing that routes around bodies rather than through them.
- Tap grammar and four placeholder abilities — see [[Tap Input]].
- Three visual treatments and two camera modes — see [[Visual Treatments]].
  Default is `board`.
- Four biome palettes composing over any treatment — see [[Biomes]].
- One ground table covering flora and gear, both gatherable, counted in the HUD
  — see [[Equipment]].
- Player drawn as a ring with their level inside it, condensed at two digits,
  with an `lvl+` control cycling 1→25 — see [[Player Representation]].

## Known state

- **Single player.** The scheduler supports more actors; only one is wired.
- **Flora traits are strings doing nothing.** `fibrous`, `resinous`, `brittle` are
  written into the ground table and surfaced in the log on gather. There is no
  crafting system consuming them.
- **Gear has no stats and cannot be equipped.** It spawns, renders and is picked
  up. That is all. They are a placeholder for the "craft gear"
  pillar in [[Premise]], not a designed trait system.
- **Monster AI is minimal.** See player → step toward or attack. Otherwise wander.
- **Enemies are `□` husks.** The base enemy glyph is stated; "husk" is Raum's
  own word, taken from project-raum's hub arc. The heavier `▣` variant is a
  placeholder — glyph and existence both unstated.
- **Gear has stats and equips**, with lunge, slash, projectile and weapon swing
  — see [[Equipment]] and [[Combat Presentation]].
- Sixteen hostiles, fixed. No spawning, no progression, no death state beyond a
  screen.
- Inline script, not ES modules. Deliberate for a single-file prototype; will not
  survive contact with a second prototype.

## Not in it

No co-op, no networking, no crafting, no gear, no persistence.

Related: [[Open Questions]]
