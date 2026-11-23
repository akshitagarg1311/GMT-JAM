# From Hell to Heaven

A single-player desktop browser game built with Three.js and Vite. One stage connects a third-person obstacle run to an isometric sword fight. The characters, hazards and scenery use basic geometry and flat materials.

## How a run works

1. Choose **Start Ascent**. The runner moves forward automatically. Steer with A/D or the arrow keys, jump gaps with Space, and avoid rocks and timed fire jets. A collision returns the player to the current segment's checkpoint.
2. Enter the dungeon. The camera rises, the entrance closes, and the Ash Warden approaches. Move with WASD, attack with J or left click, and dodge with K, Shift or right click. The guardian signals a heavy swing or ground slam before striking. Its recovery gives the player time to counterattack. Losing restarts the encounter.
3. Defeat the Warden, approach its golden sword and press E. Walk through the unlocked arch to begin the automatic ascent through Heaven. The victory screen shows the sword, elapsed time and retries. Escape pauses active gameplay.

## Repository layout

```text
GMT-JAM/
├── index.html         Browser entry point. Loads main.js and defines the menu, HUD and hint elements.
├── style.css          Layout and appearance of the canvas, menus, prompts and health bars.
├── main.js            Starts the renderer and runs the game state, camera, HUD and progression.
├── stage.js           Stage registry. Defines the route, colors, speed, guardian stats, reward and next stage.
├── world.js           Builds the runner, dungeon, Heaven, characters and swords from Three.js primitives.
├── combat.js          Controls arena movement, melee hits, dodges, health and guardian attack phases.
├── input.js           Maps keyboard and mouse events to actions and tracks held and newly pressed inputs.
├── package.json       Declares dependencies and npm scripts for development and production builds.
├── package-lock.json  Records dependency versions used by npm ci.
├── .gitignore         Excludes installed dependencies and generated builds.
├── README.md          Quick start and controls.
└── AI.md              Game overview and guide to the source.
```

## Where to make changes

- **Runner hazards:** `world.js` creates the obstacle meshes and returns hazard positions. The `run` function in `main.js` uses those positions for collision checks and animates the fire cycle. Update both when changing a hazard's footprint.
- **Guardian balance:** Edit health, damage, chase speed and attack order in `stage.js`. Edit attack range, wind-up and recovery in `combat.js`, alongside the floor indicators and hit detection.
- **Stage progression:** `main.js` loads the stage named `depths` when a run begins. To chain another stage using existing hazards and attacks, register its definition in `stage.js` and set the preceding stage's `next` to the new key. A null `next` leads to Heaven.
- **Controls:** Change action bindings in `input.js` and update the control reminders in `main.js` and `README.md`. The render loop consumes one-frame actions once per frame.

## Run locally

Open a terminal in the directory containing `package.json`. With Node.js 22.12 or newer, run `npm ci` and then `npm run dev`. Open the local URL Vite prints. For static hosting, run `npm run build` and serve the generated `dist/` directory.
