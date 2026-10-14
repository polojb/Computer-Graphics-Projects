import { createLevel as createLevel0 } from './level0.js'; // single 2x2x2 cube
import { createLevel as createLevel1 } from './level1.js'; // procedural grid, scaling, colors, orbit camera
import { createLevel as createLevel2 } from './level2.js'; // landscape from color + height map images
import { createLevel as createLevel3 } from './level3.js'; // skyscape + bezier paths
import { createLevel as createLevel4 } from './level4.js'; // lighting, skybox, atmosphere, extras

const LEVELS = {
    0: createLevel0,
    1: createLevel1,
    2: createLevel2,
    3: createLevel3,
    4: createLevel4,
};

const canvas = document.getElementById('canvas');
const infoEl = document.getElementById('info');

const gl = canvas.getContext('webgl', { antialias: true });
if (!gl) {
  infoEl.textContent = 'WebGL is not supported in this browser.';
  throw new Error('WebGL not supported');
}

let currentLevel = null;