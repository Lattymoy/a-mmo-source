import { S } from '../core/state.js';
import { GROUND } from '../world/ground.js';
import { ABIL } from '../game/abilities.js';
import { arm } from '../game/input.js';
import { refreshEq, isEqOpen } from './equipment.js';

const $ = id => document.getElementById(id);

export function abilityBar(){
  const barEl = $('bar');
  barEl.innerHTML = '';
  for(const A of ABIL){
    const cool = (S.cooldown[A.id] || 0) > S.clock;
    const b = document.createElement('button');
    b.className = 'ab' + (S.armed === A.id ? ' armed' : '') + (cool ? ' cool' : '');
    b.innerHTML = `<span class="g">${A.g}</span><span class="n">${A.name}</span>`;
    if(cool){
      const left = (S.cooldown[A.id] - S.clock) / A.cd;
      const d = document.createElement('div');
      d.className = 'cd';
      d.style.width = (100 * (1 - left)) + '%';
      b.appendChild(d);
    }
    b.onclick = () => { arm(A.id); hud() };
    barEl.appendChild(b);
  }
}

export function hud(){
  const p = S.player;
  $('hp').textContent  = Math.max(0, p.hp);
  $('lvl').textContent = p.lvl;
  $('clk').textContent = Math.floor(S.clock / 100);

  const carried = Object.entries(p.inv).filter(([, n]) => n > 0)
    .map(([k, n]) => `${GROUND[k].g}${n}`).join(' ');
  $('inv').textContent = carried || '\u2014';

  $('dead').style.display = S.dead ? 'flex' : 'none';
  if(isEqOpen()) refreshEq();
  abilityBar();
}
