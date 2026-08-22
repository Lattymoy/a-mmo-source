/* Tunables. Anything a designer would reach for lives here, not buried in code. */

export const W = 56, H = 56;      // world size in tiles
export const FOV = 8;             // sight radius — see docs/bible Platforms: this
                                  // must stay at or under the mobile visible range
                                  // or desktop players get live info mobile lacks

export const LVL_MAX = 25;        // max level, base game

export const MS_PER_TICK = 1.05;  // real ms per game tick; a 100-tick step is 105ms
export const MOVE_MS = 95;        // glyph slide, lands just before the next step
export const LUNGE_MS = 190;      // attack lunge and weapon swing
export const SLASH_MS = 170;
export const SHOT_MS = 190;

export const BASE_ATK = 3;        // unarmed still hits for something

export const COLS = { close: 11, tactical: 25 };
export const MONO = 'ui-monospace, Menlo, Consolas, monospace';
