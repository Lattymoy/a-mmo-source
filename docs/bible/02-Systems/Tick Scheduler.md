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

Rate is tuned by feel and then pinned by a test. 0.70ms/tick (70ms per step)
read as too fast; it now sits at **1.05ms per tick — 105ms per step, about 9.5
steps per second**. The glyph slide is 95ms so it lands just before the next
step.

The suite asserts the pace stays inside a readable band (7–12 steps/sec) rather
than asserting a single number, so the value can be tuned without rewriting the
gate, while a regression that divides pace by actor count still fails loudly.

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
