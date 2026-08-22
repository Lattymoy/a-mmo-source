# Platforms

**Status:** `STATED`

Playable on **desktop and mobile**. Not mobile-only.

**On mobile, the viewport enlarges for bosses.**

## What this changes

The 9×14 thumb-legible tile budget in [[Visual Treatments]] is a **mobile
constraint, not a design constraint**. Desktop has no such ceiling.

The boss framing question in [[Progression]] is settled for mobile: the view
enlarges. That is stated, not proposed.

## Input across platforms

**Status:** `OPEN`

The tap grammar in [[Tap Input]] was designed against mobile constraints —
specifically the absence of hover. Desktop has hover, a cursor, and a keyboard.

Undecided:

- Whether desktop mirrors the tap grammar exactly (click = tap), or gains
  keyboard movement alongside it.
- Whether the lit-tile arming set stays on desktop, where hover could preview
  targeting instead. Consistency argues for keeping it; desktop convention
  argues for hover.

Not stated either way. Do not assume.

## Information asymmetry in co-op

**Status:** `PROPOSED` — consequence worth recording before it bites

Missions are matchmade ([[World Structure]]), so a desktop player and a mobile
player can be in the same instance seeing very different amounts of it.

This is mostly already handled: [[Architecture]] limits knowledge by **FOV radius**,
not by viewport. A desktop player with a wider screen sees more *explored
memory*, not more live information.

The gap that remains is live enemies at the screen edge — a desktop player can
have a hostile in FOV and on screen while the mobile player has it in FOV and
off screen. Keeping FOV radius at or under the mobile visible range closes it
entirely.

Related: [[Visual Treatments]] · [[Progression]] · [[Open Questions]]
