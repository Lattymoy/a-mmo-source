/* Seeded RNG. Every world is reproducible from its seed — needed the moment two
   players have to generate the same instance. */

export function mulberry32(a){
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

let rnd = mulberry32(Date.now() & 0xffffffff);

export function reseed(seed){ rnd = mulberry32(seed | 0); return seed }
export function rand(){ return rnd() }
export function ri(n){ return Math.floor(rnd() * n) }
export function pick(arr){ return arr[ri(arr.length)] }
