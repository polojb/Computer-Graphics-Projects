/*
Cube landscape from image data
    - Outside of your program, create or find two image files:
    > a color image file (png) which will contain the color information you will show in your project. 

    > a height map image file (png) which will contain height information for the cubes in your scene.  
    This file should be grayscale (just shades of gray).  The shade will correspond to the height of the cubes in the grid.
    
    - Load these image files and use a method to sample them to find the color of the cubes in your scene and the height of 
    the cubes in your scene. Questions to consider:
    > Suppose your grid is 100x100, but your images are 1000x1000 pixels.  How will you choose what color to make the cubes?

    > Suppose the colors go from 0-255 in the grayscale height map.  How will your use these values to assign real heights 
    to the cubes in your scene? 

    - After sampling, use the identified colors and heights to assign colors and heights to the cubes.
*/

window.Levels = window.Levels || {};
 
(function () {
    const vertexShaderSource = `
        attribute vec3 aPosition;
        attribute vec3 aColor;
        uniform mat4 uModel;
        uniform mat4 uView;
        uniform mat4 uProj;
        uniform vec3 uTint;
        varying vec3 vColor;
        void main() {
            vColor = aColor * uTint;
            gl_Position = uProj * uView * uModel * vec4(aPosition, 1.0);
        }`;
 
    const fragmentShaderSource = `
        precision mediump float;
        varying vec3 vColor;
        void main() {
            gl_FragColor = vec4(vColor, 1.0);
        }`;
 

    const positions = [
        -1, -1,  1,   1, -1,  1,   1,  1,  1,  -1,  1,  1,  // front
        -1, -1, -1,  -1,  1, -1,   1,  1, -1,   1, -1, -1,  // back
        -1,  1, -1,  -1,  1,  1,   1,  1,  1,   1,  1, -1,  // top
        -1, -1, -1,   1, -1, -1,   1, -1,  1,  -1, -1,  1,  // bottom
         1, -1, -1,   1,  1, -1,   1,  1,  1,   1, -1,  1,  // right
        -1, -1, -1,  -1, -1,  1,  -1,  1,  1,  -1,  1, -1   // left
    ];
 
    const faceBrightness = [0.8, 0.6, 1.0, 0.4, 0.7, 0.5]; // front, back, top, bottom, right, left
    const colors = [];
    for (let f = 0; f < 6; f++) {
        for (let v = 0; v < 4; v++) {
            const y = positions[(f * 4 + v) * 3 + 1];
            const b = faceBrightness[f] * (y > 0 ? 1.0 : 0.6);
            colors.push(b, b, b);
        }
    }
 
    const indices = [
        0,  1,  2,   0,  2,  3,
        4,  5,  6,   4,  6,  7,
        8,  9, 10,   8, 10, 11,
        12, 13, 14,  12, 14, 15,
        16, 17, 18,  16, 18, 19,
        20, 21, 22,  20, 22, 23
    ];
 
    const COLOR_IMAGE_URL  = 'assets/color.png';
    const HEIGHT_IMAGE_URL = 'assets/height.png';
    const WORLD_SIZE   = 256;
    const MAX_HEIGHT   = 50;
    const MIN_HEIGHT   = 0.2;
    const USE_AVERAGING = true;
    let   currentRes   = 64;
 
    let program, posBuf, colBuf, idxBuf, loc;
    let colorImg = null, heightImg = null;
    let cubes = [];
 
    function loadPixels(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const c = document.createElement('canvas');
                c.width = img.width;
                c.height = img.height;
                const ctx = c.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const data = ctx.getImageData(0, 0, img.width, img.height).data; // r,g,b,a,r,g,b,a...
                resolve({ data, w: img.width, h: img.height });
            };
            img.onerror = () => reject(new Error('Could not load ' + url));
            img.src = url;
        });
    }
 
    function sample(img, col, row, gridSize) {
        const x0 = (col / gridSize) * img.w;
        const y0 = (row / gridSize) * img.h;
 
        if (!USE_AVERAGING) {
            const px = Math.min(img.w - 1, Math.floor(x0 + img.w / gridSize / 2));
            const py = Math.min(img.h - 1, Math.floor(y0 + img.h / gridSize / 2));
            const i = (py * img.w + px) * 4;
            return [img.data[i], img.data[i + 1], img.data[i + 2]];
        }
 
        const bw = Math.max(1, Math.floor(img.w / gridSize));
        const bh = Math.max(1, Math.floor(img.h / gridSize));
        const startX = Math.floor(x0), startY = Math.floor(y0);
        let r = 0, g = 0, b = 0, n = 0;
        for (let py = startY; py < startY + bh && py < img.h; py++) {
            for (let px = startX; px < startX + bw && px < img.w; px++) {
                const i = (py * img.w + px) * 4;
                r += img.data[i]; g += img.data[i + 1]; b += img.data[i + 2];
                n++;
            }
        }
        return [r / n, g / n, b / n];
    }
 
    function modelMatrix(x, height, z, spacing) {
        const sx = spacing / 2, sy = height / 2, sz = spacing / 2;
        return new Float32Array([
            sx, 0,  0,  0,
            0,  sy, 0,  0,
            0,  0,  sz, 0,
            x,  height / 2, z, 1
        ]);
    }
 
    function buildCubes(gridSize) {
        if (!colorImg || !heightImg) return;
 
        const spacing = WORLD_SIZE / gridSize;
        const next = [];
 
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const x = (col - (gridSize - 1) / 2) * spacing;
                const z = (row - (gridSize - 1) / 2) * spacing;
 
                const gray = sample(heightImg, col, row, gridSize)[0];
                const height = MIN_HEIGHT + (gray / 255) * MAX_HEIGHT;
 
                const [r, g, b] = sample(colorImg, col, row, gridSize);
                const color = [r / 255, g / 255, b / 255];
 
                next.push({ model: modelMatrix(x, height, z, spacing), color });
            }
        }
        cubes = next;
        currentRes = gridSize;
    }
 
    function compile(gl, type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        return s;
    }
 
    function makeBuffer(gl, target, data) {
        const b = gl.createBuffer();
        gl.bindBuffer(target, b);
        gl.bufferData(target, data, gl.STATIC_DRAW);
        return b;
    }
 
    window.Levels.level2 = {
        init(gl) {
            program = gl.createProgram();
            gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexShaderSource));
            gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentShaderSource));
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                throw new Error(gl.getProgramInfoLog(program));
            }
 
            posBuf = makeBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(positions));
            colBuf = makeBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(colors));
            idxBuf = makeBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices));
 
            loc = {
                pos:   gl.getAttribLocation(program, 'aPosition'),
                col:   gl.getAttribLocation(program, 'aColor'),
                model: gl.getUniformLocation(program, 'uModel'),
                tint:  gl.getUniformLocation(program, 'uTint'),
                view:  gl.getUniformLocation(program, 'uView'),
                proj:  gl.getUniformLocation(program, 'uProj')
            };
 
            Promise.all([loadPixels(COLOR_IMAGE_URL), loadPixels(HEIGHT_IMAGE_URL)])
                .then(([c, h]) => {
                    colorImg = c;
                    heightImg = h;
                    buildCubes(currentRes);
                })
                .catch(err => console.error(err));
 
            const sel = document.getElementById('res');
            if (sel) {
                sel.value = String(currentRes);
                sel.addEventListener('change', e => buildCubes(parseInt(e.target.value, 10)));
            }
        },
 
        setResolution(n) { buildCubes(n); },
 
        draw(gl, camera) {
            gl.useProgram(program);
 
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
            gl.vertexAttribPointer(loc.pos, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(loc.pos);
 
            gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
            gl.vertexAttribPointer(loc.col, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(loc.col);
 
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
 
            gl.uniformMatrix4fv(loc.view, false, camera.view);
            gl.uniformMatrix4fv(loc.proj, false, camera.proj);
 
            for (const cube of cubes) {
                gl.uniformMatrix4fv(loc.model, false, cube.model);
                gl.uniform3fv(loc.tint, cube.color);
                gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
            }
        }
    };
})();