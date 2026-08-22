# Progression

**Status:** `STATED`

You take on **large bosses**. Bosses drop **material**.

Material feeds three stated verbs:

| Verb | Stated as |
| --- | --- |
| upgrade | improve something you have |
| refine | — |
| build | make new weaponry |

"Upgrade, refine, and build amazing weaponry" is the full stated scope. The
distinction between the three verbs has not been defined and must not be
assumed.

## This is the crafting pillar

"Craft gear" in [[Premise]] now has a source: boss material. That resolves where
gear comes from.

It does **not** resolve what scavenged flora is for. Flora gathering exists in
[[tap-grid]] with placeholder trait strings. Whether flora is a second material
track, a consumable track, or vestigial is [[Open Questions|open]].

## Large bosses vs. the viewport

**Status:** `PROPOSED` — the one real tension in the stated design

A phone at thumb-legible tile size shows roughly 9×14 tiles
([[Visual Treatments]]). A "large boss" that reads as large has to occupy
multiple tiles — and at 11 columns, a 5×5 occupant is half the screen.

That is not a problem to engineer away. An ASCII boss that fills your screen is
oppressive in exactly the right way, and it is free — no art budget, no rig.

**Call:** bosses are multi-tile occupants. Boss encounters widen the camera to a
fixed framing rather than keeping the exploration camera. Tiles get smaller, but
boss fights target far fewer distinct tiles than exploration does, so thumb
accuracy suffers less than it would elsewhere.

Untested. Flag if it fails in practice.

Related: [[World Structure]] · [[Tap Input]] · [[Open Questions]]
