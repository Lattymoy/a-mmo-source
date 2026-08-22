# Tick Scheduler

**Status:** `PROPOSED` (raised in discussion) · `BUILT` (running in [[Architecture]])

Not stated by Mac. Proposed as the answer to co-op, and built into the prototype
so the input model could be tested against it.

## The problem

"Fight the monsters head on with friends" ([[Premise]]) rules out strict
turn-based lockstep: one player on a train stalls everyone.

## The rule

The world advances on a clock. Every action costs energy. An actor with nothing
to do is **skipped, not waited on**.

Time only moves when someone acts, but nobody can stall it.

## Consequences

- Netcode syncs a tick counter and an action queue, not positions.
- Action cost becomes a real design axis — a heavy weapon is slower than a light one.
- Turn-based feel with real-time tolerance.

## Pacing is a property of game time, not actor count

**Status:** `BUILT` — root fix, 2026-08-22

The first build paced the scheduler at one actor per 68ms of real time. That is
wrong at the root: with 17 actors on the clock, the player's own turn came round
roughly every seventeenth slot, so movement felt sluggish — and it would have
degraded further with every monster added.

**Fix:** the clock advances at a fixed real-time rate (`MS_PER_TICK`), and every
actor whose turn has come due resolves in the same frame. Verified by
simulation: player step rate holds at 14.3/sec across 0, 16, 64 and 256
monsters.

### Pace is taste, so it gets a dial

70ms per step read as too fast. 105ms still read as too fast. Rather than keep
guessing at a constant, pace is **runtime-adjustable**: `S.msPerTick` with a
`pace` control in the top bar cycling 6.3 / 5.0 / 4.2 / 3.3 / 2.6 steps per
second.

**Default is 2.4ms per tick — 240ms per step, ~4.2 steps/sec.**

The glyph slide is derived, not configured (`moveMsFor`), so it always lands
just before the next step at every pace. A hand-set slide would desync the
moment the dial moved.

The suite no longer asserts any particular speed — that would be gating taste.
It asserts the scheduler **delivers the pace it was configured with**, at every
position on the dial, and that the slide always finishes inside a step. A
regression that divides pace by actor count still fails loudly.

**The idle rule still holds.** When the player has nothing queued the clock
stops. Monsters do not get free turns while you think. In co-op another player
acting is what advances it — which is the whole point of
[[World Structure|the bounded party]].

## Prototype costs

**Status:** `BUILT` — tuning values, not balance

| Action | Ticks |
| --- | --- |
| step | 100 |
| attack | 120 |
| dash | 60 |
| cleave | 150 |
| hurl | 100 |
| gather | 80 |

Monster speeds: rat 70, kobold 90, troll 160.

## Untested

The scheduler runs **one player actor** today. Two players on one clock is the
test that decides whether the pacing survives. See [[Open Questions]].

Related: [[Tap Input]] · [[Prior Art]]
