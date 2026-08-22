/* Tunables. Anything a designer would reach for lives here, not buried in code. */

export const W = 56, H = 56;      // world size in tiles
export const FOV = 8;             // sight radius — see docs/bible Platforms: this
                                  // must stay at or under the mobile visible range
                                  // or desktop players get live info mobile lacks

export const LVL_MAX = 25;        // max level, base game

/* Pace. A 100-tick step is the unit: MS_PER_TICK * 100 is how long one step
   takes in real time. Runtime-adjustable via S.msPerTick — the value is taste,
   so it gets a dial rather than a guess. */
export const MS_PER_TICK = 2.4;   // a 100-tick step is 240ms, ~4.2 steps/sec
export const PACE_STEPS = [1.6, 2.0, 2.4, 3.0, 3.8];

// the glyph slide always lands just before the next step, whatever the pace
export const moveMsFor = msPerTick => msPerTick * 90;
export const LUNGE_MS = 190;      // attack lunge and weapon swing
export const SLASH_MS = 170;
export const SHOT_MS = 190;

export const BASE_ATK = 3;        // unarmed still hits for something

export const COLS = { close: 11, tactical: 25 };
export const MONO = 'ui-monospace, Menlo, Consolas, monospace';
