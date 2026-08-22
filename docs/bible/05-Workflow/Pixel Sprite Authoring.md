# Pixel Sprite Authoring

**Status:** `BUILT` — 2026-08-22. The workflow that produced the wooden gear set.

Sprites are **built, not typed**. Nobody places 390 pixels by hand in a source
file. Each sprite is constructed from rules — taper by row, shading by column
offset — and then hand-placed detail is laid on top: grain, bindings,
highlights, the lit crown of a bow.

That mix is the whole trick. The rules keep edges and shading consistent across
a sprite and across the set, so everything looks like it came from one hand. The
hand-placed pixels stop it looking mechanical.

## The loop

The method is not "draw a sprite". It is:

1. **Author** the construction in `tools/sprites/author.mjs`.
2. **Render** it to a PNG preview: `npm run sprites`.
3. **Look at it.** Actually open the image.
4. **Revise** and repeat.

Step 3 is the one that matters and the one that is easy to skip. Nothing about
a sprite's quality is visible in its source code.

Evidence from this set:

| What the source looked like | What the image showed |
| --- | --- |
| Sword, first pass | Blunt tip, guard two rows too thick, grain reading as dirt |
| Bow, three passes | A bucket, then a closed ring, then a bow |
| Shield, first pass | Three plank seams — noise; two reads as boards |

None of that was predictable from reading the code. All of it was obvious in a
16×-scaled PNG.

## Generated, never transcribed

`npm run sprites` writes **both** the preview image and
`src/render/gear-sprites.js` from the same run. What ships is byte-for-byte what
was looked at; there is no copying step in between to get wrong.

`src/render/gear.js` is the renderer and is hand-written. The data module is
generated and carries a do-not-edit header.

**A test enforces this.** It re-runs the authoring source in memory and compares
pixel-for-pixel against the committed data. Change one pixel in `author.mjs` and
forget to regenerate, and the suite fails with `shield: pixels`. Verified by
doing exactly that.

## Moving things get POSES, not simulation

The cape proved this and was then cut, but the lesson stands and applies to the
next moving thing: a simulation can only produce filled shapes, never a
hand-placed pixel, so anything that must read as pixel art gets **authored
poses** swapped by state.

The technique that makes it cheap: rasterize each pose **parametrically**, so a
45° variant can be *authored at 45°* with correct pixel stepping rather than
rotated at runtime. Six poses then cover eight directions, because the
remaining turns are 90° and pixel-exact.

## Dynamic things can be pixel art too

Sprites cover static gear. Anything that moves every frame — the cape, the
hand nubs, the body — goes through the **pixel buffer** in `avatar.js` instead:
draw at the game's density into an offscreen canvas, quantize to a fixed palette
with hard alpha, blit up with smoothing off.

Same look, no authored frames, physics intact. See [[Character Presentation]].

## Rules that came out of the work

- **Palette letters, not colours.** Rows are `K D M L H C`, resolved through a
  material at draw time. One sprite renders in any material, which is what
  [[Progression]]'s material-driven weaponry needs.
- **Outline only the exterior.** Outlining every empty neighbour also fills any
  *hole*, which turned the bow's opening into a solid block. Flood-fill from the
  border first, then outline against genuinely outside space.
- **Grain runs in long streaks, not per-pixel noise.** Modulo-scattered dark
  pixels read as dirt on the blade. Three or four streaks along the length read
  as timber.
- **Every sprite declares a `grip`** — the pixel the hand holds — so a sword
  hangs from its handle and a bow from its riser, rather than everything
  floating by its centre. A test asserts the grip lands on a solid pixel; the
  bow's first grip fell in its hollow interior.
- **One density for everything.** A sprite's world size is `rows / DENSITY`,
  never a per-item scale factor. The bow was authored at 25 px/tile against the
  sword's 37.5 and had to be redrawn larger, not scaled down.
- **Detail that survives is detail that is 2px or more.** A one-pixel highlight
  at tile size is invisible; the same pixel doubled reads as a facet.

## Adding a sprite

```
1. add a builder function in tools/sprites/author.mjs
2. npm run sprites
3. open public/sprite-sheet.png and judge it
4. repeat 1-3 until it reads
5. register it in GEAR_ART, give the item a `material`
6. npm test
```

The suite will check it is rectangular, uses only palette letters, has a grip on
a solid pixel, and cannot reach back into the body — see [[Equipment]].

Related: [[Equipment]] · [[Visual Treatments]] · [[Architecture]]
