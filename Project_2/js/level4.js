/*
Additional experiments
    - Experiment with creating light conditions, adding a skybox, and using atmospheric effects to make 
    the scene look interesting.

    - Do something interesting and fun with your scene.
*/

window.Levels = window.Levels || {};
 
(function () {
    const M4 = {
        translate(x, y, z) {
            return new Float32Array([1,0,0,0,  0,1,0,0,  0,0,1,0,  x,y,z,1]);
        },
        scale(x, y, z) {
            return new Float32Array([x,0,0,0,  0,y,0,0,  0,0,z,0,  0,0,0,1]);
        },
        rotateX(a) {
            const c = Math.cos(a), s = Math.sin(a);
            return new Float32Array([1,0,0,0,  0,c,s,0,  0,-s,c,0,  0,0,0,1]);
        },
        rotateY(a) {
            const c = Math.cos(a), s = Math.sin(a);
            return new Float32Array([c,0,-s,0,  0,1,0,0,  s,0,c,0,  0,0,0,1]);
        },
        multiply(a, b) {
            const out = new Float32Array(16);
            for (let c = 0; c < 4; c++) {
                for (let r = 0; r < 4; r++) {
                    out[c * 4 + r] =
                        a[r]      * b[c * 4]     +
                        a[4 + r]  * b[c * 4 + 1] +
                        a[8 + r]  * b[c * 4 + 2] +
                        a[12 + r] * b[c * 4 + 3];
                }
            }
            return out;
        },
        mul(...ms) {
            return ms.reduce((acc, m) => M4.multiply(acc, m));
        }
    };
 
    const vertexShaderSource = `
        attribute vec3 aPosition;
        attribute vec3 aColor;
        uniform mat4 uModel;
        uniform mat4 uView;
        uniform mat4 uProj;
        uniform vec3 uTint;
        uniform float uGlow;
        varying vec3 vColor;
        void main() {
            vColor = mix(aColor * uTint, uTint, uGlow);
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
 
    const faceBrightness = [0.8, 0.6, 1.0, 0.4, 0.7, 0.5];
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
 
    const DAY_SECONDS = 60;
    const START_HOURS = 9;
    const SKY_RADIUS  = 150;
 

    const DAY_SKY    = [0.55, 0.75, 0.95];
    const NIGHT_SKY  = [0.02, 0.03, 0.10];
    const SUNSET_SKY = [0.95, 0.55, 0.35];
 
    const clamp01 = x => Math.max(0, Math.min(1, x));
    const mix3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
 
    let seed = 777;
    function rnd() {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
    }
    const stars = [];
    for (let i = 0; i < 80; i++) {
        const theta = rnd() * Math.PI * 2;
        const phi = 0.1 + rnd() * 1.35;
        stars.push([
            SKY_RADIUS * Math.cos(phi) * Math.cos(theta),
            SKY_RADIUS * Math.sin(phi),
            SKY_RADIUS * Math.cos(phi) * Math.sin(theta)
        ]);
    }
 
    let GL, program, posBuf, colBuf, idxBuf, loc;
    let manualHours = null;
 
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
 
    function drawGlowCube(model, tint) {
        GL.uniformMatrix4fv(loc.model, false, model);
        GL.uniform3fv(loc.tint, tint);
        GL.uniform1f(loc.glow, 1);
        GL.drawElements(GL.TRIANGLES, 36, GL.UNSIGNED_SHORT, 0);
    }
 
    window.Levels.level4 = {
        init(gl) {
            GL = gl;
 
            program = gl.createProgram();
            gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexShaderSource));
            gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentShaderSource));
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
 
            posBuf = makeBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(positions));
            colBuf = makeBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(colors));
            idxBuf = makeBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices));
 
            loc = {
                pos:   gl.getAttribLocation(program, 'aPosition'),
                col:   gl.getAttribLocation(program, 'aColor'),
                model: gl.getUniformLocation(program, 'uModel'),
                tint:  gl.getUniformLocation(program, 'uTint'),
                glow:  gl.getUniformLocation(program, 'uGlow'),
                view:  gl.getUniformLocation(program, 'uView'),
                proj:  gl.getUniformLocation(program, 'uProj')
            };
 
            const slider = document.getElementById('timeOfDay');
            if (slider) slider.addEventListener('input', e => { manualHours = parseFloat(e.target.value); });
            const auto = document.getElementById('autoTime');
            if (auto) auto.addEventListener('click', () => { manualHours = null; });
        },
 
        setTime(hours) { manualHours = hours; },
 
        draw(gl, camera) {
            const now = performance.now() / 1000;
            const hours = manualHours !== null
                ? manualHours
                : (START_HOURS + (now / DAY_SECONDS) * 24) % 24;
 
            const a = ((hours - 6) / 24) * Math.PI * 2;
            const h = Math.sin(a);
 
            const day  = clamp01((h + 0.15) / 0.45);
            const warm = clamp01(1 - Math.abs(h) / 0.25);
 
            const sky = mix3(mix3(NIGHT_SKY, DAY_SKY, day), SUNSET_SKY, warm * 0.6);
            window.skyColor = sky;
 
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
 
            const sunPos  = [ SKY_RADIUS * Math.cos(a),  SKY_RADIUS * Math.sin(a),  SKY_RADIUS * 0.3];
            const moonPos = [-SKY_RADIUS * Math.cos(a), -SKY_RADIUS * Math.sin(a), -SKY_RADIUS * 0.3];
 
            if (sunPos[1] > 2) {
                drawGlowCube(M4.mul(M4.translate(...sunPos), M4.rotateY(now * 0.3), M4.rotateX(now * 0.2), M4.scale(6, 6, 6)),
                             [1.0, 0.85, 0.35]);
            }
            if (moonPos[1] > 2) {
                drawGlowCube(M4.mul(M4.translate(...moonPos), M4.rotateY(now * 0.1), M4.scale(4, 4, 4)),
                             [0.85, 0.9, 1.0]);
            }
 
            if (day < 0.98) {
                for (let i = 0; i < stars.length; i++) {
                    const size = 0.45 * (1 - day) * (0.7 + 0.3 * Math.sin(now * 3 + i));
                    if (size < 0.02) continue;
                    drawGlowCube(M4.mul(M4.translate(...stars[i]), M4.scale(size, size, size)), [1, 1, 1]);
                }
            }
        }
    };
})();