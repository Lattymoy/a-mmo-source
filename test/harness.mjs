/* Boots the game's module graph headlessly with a stub DOM, so every system
   below the UI can be asserted without a browser. Nothing in src/ may touch
   the DOM at import time or this breaks — which is the point. */

function stubEl(){
  const o = {
    style: {}, textContent: '', innerHTML: '', className: '',
    classList: { _s: new Set(),
      add(x){ this._s.add(x) }, remove(x){ this._s.delete(x) },
      contains(x){ return this._s.has(x) } },
    appendChild(){}, addEventListener(){},
    getBoundingClientRect: () => ({ width: 400, height: 700, left: 0, top: 0 }),
    getContext: () => new Proxy({ save(){}, restore(){} },
                                { get: () => () => {}, set: () => true }),
  };
  o.parentElement = { getBoundingClientRect: o.getBoundingClientRect };
  return o;
}

const cache = new Map();
globalThis.document = {
  getElementById(id){ if(!cache.has(id)) cache.set(id, stubEl()); return cache.get(id) },
  createElement: stubEl,
};
globalThis.requestAnimationFrame = () => {};
globalThis.addEventListener = () => {};
globalThis.devicePixelRatio = 1;
if(!globalThis.performance) globalThis.performance = { now: () => Date.now() };

let failed = 0, passed = 0;
export function check(name, cond, detail){
  if(cond){ passed++; console.log(`  ok   ${name}`) }
  else { failed++; console.log(`  FAIL ${name}${detail ? ' \u2014 ' + detail : ''}`) }
}
export function group(name){ console.log(`\n${name}`) }
export function report(){
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

/* Fresh world without going through main.js (which auto-boots the loop). */
export async function newWorld(seed = 12345){
  const { reseed }       = await import('../src/core/rng.js');
  const { S, resetRun }  = await import('../src/core/state.js');
  const { genMap, openTiles } = await import('../src/world/mapgen.js');
  const { scatterGround }= await import('../src/world/ground.js');
  const { spawn }        = await import('../src/game/entities.js');
  const { computeFOV }   = await import('../src/world/fov.js');
  reseed(seed);
  const openCount = genMap();
  const open = openTiles();
  scatterGround(open);
  spawn(open);
  resetRun();
  computeFOV();
  return { S, openCount };
}
