# Architecture

**Status:** `BUILT` — 2026-08-22, split out of the single-file prototype.

The prototype was one 960-line HTML file. It is now a module graph. Same game,
same behaviour; the file was the only thing that changed.

## Layout

```
index.html          shell: markup, CSS, mounts src/main.js
src/
  core/             config, seeded rng, grid maths, shared state
  world/            mapgen, wall geometry, fov, pathing, ground items
  game/             entities, stats, abilities, actions, scheduler, input, fx
  render/           themes and biomes, camera, character (cape/hands), canvas draw
  ui/               hud, equipment panel, log
test/               headless harness + suite
tools/              build helpers
```

## Two rules that make it testable

**The DOM lives only in `src/ui/`, `src/render/camera.js`, and `src/main.js`.**
Nothing below that line touches `document`, and nothing anywhere touches it at
import time. That is what lets the whole simulation run under Node with a stub
DOM — 30 assertions, no browser, in well under a second.

**State is one mutable object,** `S` in `src/core/state.js`, not a set of `let`
exports. It keeps the graph acyclic and guarantees no module reads a stale copy.

## Import direction

`core ← world ← game ← render/ui ← main`. Two places needed care:

- `abilities` and `actions` both resolve attacks, so `stepTo` and `damage` live
  down in `entities` where both can reach them without a cycle.
- `stats.equip()` no longer refreshes the HUD; the UI does that after calling
  it. Game logic must not know the UI exists.

## Seeded generation

RNG is seeded and reseeded per run rather than pulled from `Math.random` inline.
Two players cannot share an instance otherwise — the seed is what makes a
mission reproducible on both machines. Not needed yet; free to do now, painful
to retrofit.

## What the suite gates

Wall contour continuity, face classification, full map reachability, the
equipment slot rules including two-hand exclusion, every ground kind gathering,
every ability declaring a legal target set, no ability lighting a wall, the
digit-reservation rule from [[Player Representation]], and scheduler pace
holding steady across 0/16/64/256 actors.

Browser boot is verified separately with Playwright — canvas sizes, ability bar
renders, arm lights up, a tap outside the lit set disarms, equipment panel
opens, zero console errors.

## Dev hooks

`window.__GEAR__` set before load starts the player equipped, so visual probes
can inspect held gear without hunting for floor drops. Never set in normal play.

## Known state

Carried over unchanged from the prototype:

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

No co-op, no networking, no crafting, no persistence, no hub, no missions.

Related: [[Tap Input]] — [[Tick Scheduler]] — [[Equipment]] — [[Combat Presentation]]
