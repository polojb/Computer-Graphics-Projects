/*
Create a skyscape, made out of cubes
    - Create some objects in the sky, made out of cubes that are scaled, translated and rotated into position.
    Ideas: sky islands, blimps, birds, clouds....
 
    - Some of these objects should move in paths using bezier curves.  In your documentation, describe the bezier 
    curve function you selected for these objects.
 
    - If the object gets 'far away', it can disappear and go back to its original spot and begin its movement again. 
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
        rotateZ(a) {
            const c = Math.cos(a), s = Math.sin(a);
            return new Float32Array([c,s,0,0,  -s,c,0,0,  0,0,1,0,  0,0,0,1]);
        },
        multiply(a, b) {            // returns a * b
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
        mul(...ms) {                // mul(A, B, C) = A * B * C
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
 
    let program, posBuf, colBuf, idxBuf, loc;
 
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
 
    let GL;
    function drawCube(model, tint) {
        GL.uniformMatrix4fv(loc.model, false, model);
        GL.uniform3fv(loc.tint, tint || [1, 1, 1]);
        GL.drawElements(GL.TRIANGLES, 36, GL.UNSIGNED_SHORT, 0);
    }
 
    function makeRng(seed) {
        let s = seed >>> 0;
        return function () {
            s = (s + 0x6D2B79F5) >>> 0;
            let t = s;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    const rnd = makeRng(12345);
 
    function bezier(t, p0, p1, p2, p3) {
        const u = 1 - t;
        const b0 = u * u * u;
        const b1 = 3 * u * u * t;
        const b2 = 3 * u * t * t;
        const b3 = t * t * t;
        return [0, 1, 2].map(i => b0 * p0[i] + b1 * p1[i] + b2 * p2[i] + b3 * p3[i]);
    }
 
    function drawParts(objMatrix, parts, now) {
        for (const p of parts) {
            const rot = p.rot || [0, 0, 0];
            const spin = p.spin ? p.spin * now : 0;
            const local = M4.mul(
                M4.translate(...p.pos),
                M4.rotateZ(rot[2]),
                M4.rotateY(rot[1]),
                M4.rotateX(rot[0] + spin),
                M4.scale(...p.scale)
            );
            drawCube(M4.mul(objMatrix, local), p.tint || [1, 1, 1]);
        }
    }
 
    function makeCloudParts() {
        const parts = [];
        const n = 4 + Math.floor(rnd() * 3);
        for (let k = 0; k < n; k++) {
            parts.push({
                pos:   [(rnd() - 0.5) * 9, (rnd() - 0.3) * 1.5, (rnd() - 0.5) * 4],
                scale: [2 + rnd() * 2.5, 0.8 + rnd() * 0.7, 1.5 + rnd() * 1.5]
            });
        }
        return parts;
    }
 
    const clouds = [];
    for (let i = 0; i < 12; i++) {
        const y = 38 + rnd() * 18;
        const z0 = -70 + rnd() * 140;
        clouds.push({
            path: [
                [-140, y, z0],
                [ -50, y + (rnd() - 0.5) * 140, z0 + (rnd() - 0.5) * 280],
                [  50, y + (rnd() - 0.5) * 140, z0 + (rnd() - 0.5) * 280],
                [ 140, y, z0 + (rnd() - 0.5) * 40]
            ],
            speed: 0.012 + rnd() * 0.01,
            offset: rnd(),
            size: 0.8 + rnd() * 0.8,
            parts: makeCloudParts()
        });
    }
 
    const GRASS = [0.3, 0.7, 0.25], DIRT = [0.45, 0.3, 0.18], LEAF = [0.15, 0.5, 0.2], BARK = [0.4, 0.25, 0.12];
    const islandParts = [
        { pos: [0,  0.0, 0],  scale: [9, 0.6, 9],       tint: GRASS },
        { pos: [0, -1.4, 0],  scale: [8, 0.8, 8],       tint: DIRT },
        { pos: [0, -3.1, 0],  scale: [5.5, 0.9, 5.5],   tint: DIRT },
        { pos: [0, -5.0, 0],  scale: [3, 1.0, 3],       tint: DIRT },
        { pos: [0, -6.9, 0],  scale: [1.2, 0.9, 1.2],   tint: DIRT },
        { pos: [2, 2.6, 1],   scale: [0.5, 2.0, 0.5],   tint: BARK },
        { pos: [2, 5.2, 1],   scale: [2.2, 1.6, 2.2],   tint: LEAF },
        { pos: [2, 7.4, 1],   scale: [1.4, 1.0, 1.4],   tint: LEAF, rot: [0, Math.PI / 2, 0] }
    ];
    const islands = [
        { pos: [-30, 46, 20], size: 1.0, phase: 0 },
        { pos: [ 45, 58, -40], size: 0.6, phase: 2 }
    ];
 
    window.Levels.level3 = {
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
                view:  gl.getUniformLocation(program, 'uView'),
                proj:  gl.getUniformLocation(program, 'uProj')
            };
        },
 
        draw(gl, camera) {
            const now = performance.now() / 1000;
 
            gl.clearColor(0.55, 0.75, 0.95, 1);
 
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
 
            // Clouds
            for (const c of clouds) {
                const t = (now * c.speed + c.offset) % 1;
                const pos = bezier(t, ...c.path);
                const obj = M4.mul(M4.translate(...pos));
                drawParts(obj, c.parts, now);
            }
 
            // Islands
            for (const isl of islands) {
                const bob = Math.sin(now * 0.8 + isl.phase) * 1.2;
                const obj = M4.mul(
                    M4.translate(isl.pos[0], isl.pos[1] + bob, isl.pos[2]),
                    M4.rotateY(now * 0.1 + isl.phase),
                    M4.scale(isl.size, isl.size, isl.size)
                );
                drawParts(obj, islandParts, now);
            }
        }
    };
})();
 