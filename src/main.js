import { MS_PER_TICK, LVL_MAX } from './core/config.js';
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
    S.clock += dt / MS_PER_TICK;
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
