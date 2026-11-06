const TABS = {
    0: ['level0'],
    1: ['level1'],
    2: ['level2'],
    3: ['level2', 'level3'],
    4: ['level2', 'level3', 'level4'],
};
 
 
const CAMERAS = {
    0: { r: 8,  h: 4,  target: [0, 0, 0],  speed: 0.4 },
    1: { r: 130, h: 62, target: [0, 0, 0],  speed: 0.2 },
    2: { r: 200, h: 150, target: [0, 0, 0],  speed: 0.2 },
    3: { r: 200, h: 100, target: [0, 16, 0], speed: 0.12 },
    4: { r: 200, h: 100, target: [0, 16, 0], speed: 0.12 },
};
 
 
const INFO = {
    0: 'Level 0: a single 2x2x2 cube, drawn from 24 vertices and an index buffer.',
    1: 'Level 1: a grid of cubes. Translation places them, y-scaling sets their height, and vertex colors blend from brown to green.',
    2: 'Level 2: the same grid, but each cube\'s color and height is sampled from color.png and height.png.',
    3: 'Level 3: a skyscape built from cubes. Clouds, a blimp and a flock of birds fly along Bezier curves; sky islands bob and spin.',
    4: 'Level 4: a day/night cycle. A cube sun and moon travel across the sky, stars twinkle at night, and the sky color shifts from blue to orange to dark blue.',
};
 
let current = 0;
let angle = 0;
let lastTime = 0;
 
const DEFAULT_SKY = [0.5, 0.75, 0.95];
 
const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl');
gl.enable(gl.DEPTH_TEST);
 
for (const level of Object.values(window.Levels)) level.init(gl);
 
function showLevel(n) {
    current = n;
    const info = document.getElementById('info');
    if (info) info.textContent = INFO[n];
    document.querySelectorAll('header button').forEach((b, i) => b.classList.toggle('active', i === n));
}
showLevel(0);
 
function frame(ms) {
    const time = ms / 1000;
    const dt = Math.min(time - lastTime, 0.1);
    lastTime = time;
 
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
 
    const names = TABS[current];
 
    
    for (const name of names) {
        const level = window.Levels[name];
        if (level && level.update) level.update(time);
    }
 
    // Level 4 publishes its sky color in window.skyColor; the other tabs use the default blue
    const sky = (current === 4 && window.skyColor) ? window.skyColor : DEFAULT_SKY;
    gl.clearColor(sky[0], sky[1], sky[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
    const cam = CAMERAS[current];
    angle += cam.speed * dt;
    const eye = [cam.r * Math.cos(angle), cam.h, cam.r * Math.sin(angle)];
    const camera = {
        view: lookAt(eye, cam.target),
        proj: perspective(canvas.width / canvas.height)
    };
 
    for (const name of names) {
        const level = window.Levels[name];
        if (level) level.draw(gl, camera, time);
    }
 
    requestAnimationFrame(frame);
}
 
function lookAt(e, t) {
    let l = Math.hypot(e[0] - t[0], e[1] - t[1], e[2] - t[2]);
    const z = [(e[0] - t[0]) / l, (e[1] - t[1]) / l, (e[2] - t[2]) / l];
    l = Math.hypot(z[2], z[0]);
    const x = [z[2] / l, 0, -z[0] / l];
    const y = [z[1] * x[2], z[2] * x[0] - z[0] * x[2], -z[1] * x[0]];
    const d = (a) => -(a[0] * e[0] + a[1] * e[1] + a[2] * e[2]);
    return new Float32Array([
        x[0], y[0], z[0], 0,
        x[1], y[1], z[1], 0,
        x[2], y[2], z[2], 0,
        d(x), d(y), d(z), 1
    ]);
}
 
function perspective(aspect) {
    const f = 1 / Math.tan(Math.PI / 8), n = 0.1, fa = 500;
    return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (fa + n) / (n - fa), -1,
        0, 0, 2 * fa * n / (n - fa), 0
    ]);
}
 
requestAnimationFrame(frame);