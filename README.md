# a-mmo-source

Tap-native ASCII grid game set in Raum. Desktop and mobile.

Start with the bible: [`docs/bible/00-Index.md`](docs/bible/00-Index.md)

## Run

```
npm install
npm run dev        # vite dev server
npm test           # headless suite, no browser needed
npm run build      # dist/
npm run bundle     # dist/a-mmo.html — one self-contained file
npm run sprites    # regenerate gear pixel data + public/sprite-sheet.png
```

Gear art is generated from `tools/sprites/author.mjs`; never hand-edit
`src/render/gear-sprites.js`. The workflow is documented in
`docs/bible/05-Workflow/Pixel Sprite Authoring.md` and a test enforces it.

## Layout

```
index.html          shell: markup, CSS, mounts src/main.js
src/
  core/             config, seeded rng, grid maths, shared state
  world/            map generation, wall geometry, fov, pathing, ground items
  game/             entities, stats, abilities, actions, scheduler, input, fx
  render/           themes and biomes, camera, canvas draw
  ui/               hud, equipment panel, log
test/               headless harness + suite
tools/              build helpers
```

**The DOM lives only in `src/ui/`, `src/render/camera.js`, and `src/main.js`.**
Everything below that runs headless, which is what lets `npm test` assert the
simulation without a browser. Keep it that way.

State is one mutable object in `src/core/state.js`, imported as `S`. That is
deliberate: it keeps the module graph acyclic and means no module holds a stale
copy of anything.

## Rules of this repo

- The bible records what was **stated**, **built**, **proposed**, or left **open**.
  Nothing is invented into it.
- Push to `main`. No feature branches.
- One feature at a time.
