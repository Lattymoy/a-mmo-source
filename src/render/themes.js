/* Theme owns TREATMENT — background, glyph choice, glow, cell fill, gutters,
   and entity colour. Biome owns the TERRAIN PALETTE only. They compose: any
   biome renders under any treatment.

   The PLAYER takes neither: the avatar carries its own fixed palette (see
   avatar.js) so it looks identical under every treatment and in every zone. The
   one thing you must always find instantly on screen is yourself.

   Entities and gear never take the biome tint. A husk that recolours per zone
   stops being instantly findable; a sword that turns violet gets lost on the
   floor. See docs/bible/02-Systems/Biomes.md. */
export const THEMES = {
  phosphor: {
    bg: '#05070A', floorGlyph: '\u00b7', wallGlyph: '#',
    floor: '#16342A', wall: '#2C6048', mem: '#0E2019',
    you: '#9DFFD0', gear: '#CFE9FF', mon: '#FF9B7A', flora: '#7FE8A8', cell: null,
    glow: 8, lit: '#63C4E8', grid: false,
  },
  bone: {
    bg: '#0B0A0C', floorGlyph: '.', wallGlyph: '#',
    floor: '#332C38', wall: '#6E6070', mem: '#1D1920',
    you: '#F0E6D4', gear: '#D8B87A', mon: '#C4553A', flora: '#8CA85E', cell: null,
    glow: 0, lit: '#D8A24C', grid: false,
  },
  board: {
    bg: '#080B0F', floorGlyph: '\u00b7', wallGlyph: '\u2593',
    floor: '#4A5C6A', wall: '#7E93A4', mem: '#222A33', cell: '#141B22',
    you: '#EAF4FF', gear: '#E8C87A', mon: '#E86A5A', flora: '#6FBF8E',
    glow: 0, lit: '#4E9AC4', grid: true,
  },
};

/* Band names are Raum's, verified from project-raum. Whether a mission zone IS
   a band is unstated — see Open Questions. */
export const BIOMES = {
  none:      null,
  uncorrupt: { floor: '#4A6B5A', wall: '#7E9B88', mem: '#161F1A', cell: '#111A15', flora: '#8FCF7A' },
  corrupt:   { floor: '#6B5A72', wall: '#9B84A4', mem: '#1C1622', cell: '#17111D', flora: '#B08A4A' },
  shaped:    { floor: '#55697E', wall: '#8FA6BE', mem: '#141B23', cell: '#0E151D', flora: '#7FD4E8' },
};

export function palette(theme, biome){
  return BIOMES[biome] ? Object.assign({}, THEMES[theme], BIOMES[biome]) : THEMES[theme];
}
