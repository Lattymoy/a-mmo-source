import { LVL_MAX, PACE_STEPS, moveMsFor } from './core/config.js';
import { reseed } from './core/rng.js';
import { S, resetRun } from './core/state.js';
import { genMap, openTiles } from './world/mapgen.js';
import { scatterGround } from './world/ground.js';
import { computeFOV } from './world/fov.js';
import { spawn } from './game/entities.js';
import { drain } from './game/scheduler.js';
import { tapTile } from './game/input.js';
import { THEMES, BIOMES } from './render/themes.js';
import { bindCanvas, resize, tileAt } from './render/camera.js';
import { draw } from './render/draw.js';
import { hud } from './ui/hud.js';
import { openEq, closeEq } from './ui/equipment.js';
import { bindLog, say } from './ui/log.js';

const $ = id => document.getElementById(id);

function restart(){
  reseed((Math.random() * 1e9) | 0);
  const open_ = genMap();
  const open = openTiles();
  scatterGround(open);
  spawn(open);
  resetRun();
  closeEq();
  /* Dev hooks, never set in normal play. __GEAR__ starts the player kitted out
     and __LOOT__ scatters one of each item beside them, so visual probes can
     inspect sprites without hunting the floor for drops. */
  if(globalThis.__GEAR__){
    S.player.inv = { sword: 1, shield: 1, bow: 1, daggerL: 1, daggerR: 1 };
    S.player.eq = { main: 'sword', off: 'shield' };
  }
  if(globalThis.__LOOT__){
    const around = [];
    for(let dy = -2; dy <= 2; dy++) for(let dx = -2; dx <= 2; dx++){
      const x = S.player.x + dx, y = S.player.y + dy;
      if((dx || dy) && !S.wall[y * 56 + x]) around.push(y * 56 + x);
    }
    ['sword','shield','bow','daggerL','daggerR'].forEach((k, i) => {
      if(around[i * 2]) S.ground.set(around[i * 2], k);
    });
  }
  globalThis.__EQUIP__ = (main, off) => { S.player.eq = { main, off }; hud() };
  computeFOV();
  hud();
  say(`${open_} open tiles \u2014 ${S.ents.length - 1} hostiles`);
  resize();
}

let lastT = 0;
function frame(now){
  if(S.dead || S.waiting){
    lastT = 0;                                // resume cleanly, no dt spike
  } else if(!lastT){
    lastT = now;
  } else {
    const dt = Math.min(now - lastT, 250);    // clamp after a backgrounded tab
    lastT = now;
    S.clock += dt / S.msPerTick;
    drain(hud);
  }
  draw(now);
  requestAnimationFrame(frame);
}

function cycle(obj, cur){
  const k = Object.keys(obj);
  return k[(k.indexOf(cur) + 1) % k.length];
}

export function boot(){
  const cv = $('c');
  bindCanvas(cv);
  bindLog($('log'));

  $('eq').addEventListener('pointerdown', ev => ev.stopPropagation());

  cv.addEventListener('pointerdown', ev => {
    if(S.cam === 'tactical'){                 // tactical takes no input but this
      S.cam = 'close';                        // one tap back to play
      $('bCam').textContent = 'close';
      resize();
      return;
    }
    const [x, y] = tileAt(ev.clientX, ev.clientY);
    tapTile(x, y);
    hud();
  });

  $('bEq').onclick    = openEq;
  $('eqClose').onclick = closeEq;
  $('bNew').onclick   = restart;

  // dev: cycle 1..25 to check two-digit legibility at thumb tile size
  $('bLvl').onclick = () => {
    S.player.lvl = S.player.lvl >= LVL_MAX ? 1 : S.player.lvl + 1;
    hud();
  };
  // dev: dial the pace by feel rather than guessing at a constant
  const paceLabel = () => `${(1000 / (100 * S.msPerTick)).toFixed(1)}/s`;
  $('bPace').textContent = paceLabel();
  $('bPace').onclick = e => {
    const i = PACE_STEPS.indexOf(S.msPerTick);
    S.msPerTick = PACE_STEPS[(i + 1) % PACE_STEPS.length];
    S.moveMs = moveMsFor(S.msPerTick);
    e.target.textContent = paceLabel();
  };
  $('bBiome').onclick = e => { S.biome = cycle(BIOMES, S.biome); e.target.textContent = S.biome };
  $('bTheme').onclick = e => { S.theme = cycle(THEMES, S.theme); e.target.textContent = S.theme };
  $('bCam').onclick   = e => {
    S.cam = S.cam === 'close' ? 'tactical' : 'close';
    e.target.textContent = S.cam;
    resize();
  };

  addEventListener('resize', resize);
  restart();
  requestAnimationFrame(frame);
}

boot();
