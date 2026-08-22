import { S } from '../core/state.js';
import { GROUND } from '../world/ground.js';
import { atkOf, defOf, equip } from '../game/stats.js';

const $ = id => document.getElementById(id);

export const isEqOpen = () => $('eq').classList.contains('on');
export function openEq(){ $('eq').classList.add('on'); refreshEq() }
export function closeEq(){ $('eq').classList.remove('on') }

export function refreshEq(){
  const p = S.player;

  for(const [id, slot] of [['slotOff', 'off'], ['slotMain', 'main']]){
    const k = p.eq[slot], el = $(id);
    el.textContent = k ? GROUND[k].g : '\u2014';
    el.className = 'val' + (k ? '' : ' empty');
  }
  $('eqAtk').textContent = atkOf(p);
  $('eqDef').textContent = defOf(p);

  const list = $('eqList');
  list.innerHTML = '';
  const carried = Object.entries(p.inv).filter(([k, n]) => n > 0 && GROUND[k].cls === 'gear');

  if(!carried.length){
    const d = document.createElement('div');
    d.className = 'row';
    d.textContent = 'Nothing carried. Gather gear off the floor.';
    list.appendChild(d);
    return;
  }

  for(const [k] of carried){
    const G = GROUND[k];
    const on = p.eq[G.slot] === k;
    const b = document.createElement('button');
    b.className = 'row' + (on ? ' on' : '');
    b.innerHTML =
      `<span class="g">${G.g}</span><span class="n">${G.name}</span>` +
      `<span class="s">${G.atk ? '+' + G.atk + ' atk' : ''}` +
      `${G.def ? '+' + G.def + ' def' : ''}` +
      `${G.twoHand ? ' \u00b7 two-hand' : ''}</span>`;
    b.onclick = () => { equip(k); refreshEq() };
    list.appendChild(b);
  }
}
