# Combat Presentation

**Status:** `STATED` · `BUILT` in [[tap-grid]]

Stated:

- Attacking enemies and players **lunge at each other** in melee.
- Ranged attacks **lunge back** instead.
- There is a **visible projectile**.
- Melee shows a **visible slash**.
- Weapons **move in an animated motion** when used.

## Why lunge carries the load

On a phone the damage number is often off screen or too small to read mid-fight.
The lunge is what tells you an exchange happened, who started it, and which
direction it went — before any number is parsed.

Recoil for ranged is the same signal inverted: the body pulls away from what it
is attacking, so melee and ranged are distinguishable from motion alone, with no
icon and no text.

## Built

| Element | Behaviour |
| --- | --- |
| Lunge | 190ms, sine in-and-back. Melee +0.40 tile toward target, ranged −0.22 away. |
| Slash | 170ms arc struck on the target cell, rotated to the attack direction, fading out. |
| Projectile | 190ms, travels attacker → target, glyph rotated along its path. `→` with a bow, `·` thrown. |
| Weapon swing | The held glyph rotates up to ~1.1rad and back over the lunge. Off hand rotates opposite to main. |

**The weapon swings, not the player.** The ring stays upright and legible while
what it holds moves — otherwise the level becomes unreadable exactly when a
fight is happening.

Monsters lunge and slash on the same code path. Nothing in the fx layer is
player-only.

## Open

Slash colour currently comes from `gear`, so an unarmed strike still draws a
gear-coloured arc. Fine for now; wrong if unarmed becomes a real state.

Related: [[Equipment]] · [[Player Representation]] · [[Tick Scheduler]]
