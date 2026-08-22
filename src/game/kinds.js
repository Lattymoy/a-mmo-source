/* Base enemy is a box. "Husk" is Raum's own word — taken from project-raum's
   hub arc, not invented here. The heavy variant is NOT stated: glyph and
   existence are both placeholder. See docs/bible/03-Prototypes/tap-grid.md. */
export const KINDS = {
  husk:  { g: '\u25A1', name: 'husk',  hp: 5,  spd: 85,  dmg: [1,3], sight: 9 },
  heavy: { g: '\u25A3', name: 'heavy', hp: 16, spd: 160, dmg: [4,7], sight: 8 },
};
