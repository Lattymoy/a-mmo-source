# Tap Input

## Stated model

**Status:** `STATED`

- Tap-based gathering, attacks, and movement.
- Abilities in the ability bar are tapped to **enhance or change your tap ability**.
- Tapping a monster **when in range** simply attacks.
- Tapping another position shifts you there — to move, to traverse, or to avoid attacks.

The tap is one verb whose meaning is set by context and by the armed ability.

## Prototype additions

**Status:** `BUILT` — in [[tap-grid]], not confirmed as design

These were introduced to make the stated model work on a touchscreen. They are
implementation answers, not accepted design:

- **Arming is modal, so arming lights its own legal set.** Selecting an ability
  highlights every tile it can legally target. Everything else dims.
- **Tapping outside the lit set disarms** rather than misfiring. Cooldowns are
  never burned by a fat finger.
- This also resolves "in range" for the base tap with no hover state: if the
  monster's tile is lit, the tap attacks; if not, the tap walks you toward it.
- **A queued path is committed but interruptible.** Any new tap replaces the route.

## Prototype ability set

**Status:** `BUILT` — placeholder verbs, chosen to exercise four targeting shapes

| Ability | Shape tested |
| --- | --- |
| dash | straight line, up to 3, blocked by walls and bodies |
| cleave | adjacent tile plus a 3-tile arc in that direction |
| hurl | ranged, requires line of sight |
| gather | adjacent tile containing flora |

These exist to prove the arming grammar handles line, arc, ranged and single-tile
targeting. None is a design commitment.

Related: [[Tick Scheduler]] · [[Open Questions]]
