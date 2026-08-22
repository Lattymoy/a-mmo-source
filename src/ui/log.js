import { S } from '../core/state.js';

let el = null;
export function bindLog(node){ el = node; render() }

function render(){
  if(!el) return;
  el.innerHTML = S.logs.map(l => `<div>${l}</div>`).join('');
}

export function say(s){
  S.logs.push(s);
  if(S.logs.length > 3) S.logs.shift();
  render();
}
