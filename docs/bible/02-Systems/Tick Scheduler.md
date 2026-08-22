# Tick Scheduler

**Status:** `PROPOSED` (raised in discussion) · `BUILT` (running in [[tap-grid]])

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
