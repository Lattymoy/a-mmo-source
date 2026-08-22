/* Inlines the vite build into one self-contained HTML file. The module layout
   is the source of truth; this exists only so the game can be opened straight
   off a phone with no server. */
import fs from 'fs';
import path from 'path';

const dist = 'dist';
let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

html = html.replace(/<script type="module"[^>]*src="([^"]+)"[^>]*>\s*<\/script>/g, (_, src) => {
  const js = fs.readFileSync(path.join(dist, src.replace(/^\.?\//, '')), 'utf8');
  return `<script type="module">\n${js}\n</script>`;
});
html = html.replace(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (_, href) => {
  const css = fs.readFileSync(path.join(dist, href.replace(/^\.?\//, '')), 'utf8');
  return `<style>\n${css}\n</style>`;
});

const out = path.join(dist, 'a-mmo.html');
fs.writeFileSync(out, html);
console.log(`${out} \u2014 ${(html.length/1024).toFixed(1)} kB, ${html.includes('<script type="module" src') ? 'STILL LINKED' : 'self-contained'}`);
