# From Hell to Heaven

Install with Node 22.12+ and `npm ci`, then use `npm run dev`. Run `npm run build` to generate a static site in `dist/`.

Steer with A/D or arrows and jump with Space. In the dungeon move with WASD, strike with J or left click, dodge with K, Shift or right click, and collect the sword with E. Escape pauses.

Stage definitions live in `stage.js`. Register another definition and set the previous stage’s `next` to its key. Route factories, combat and presentation reuse the same primitive models and flat materials.
