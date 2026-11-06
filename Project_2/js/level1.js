/* 
Procedural cube landscape
    - Create a landscape made out of cube models that have been positioned in along a plane (such as the x-z plane) 
    in 3D space, in a grid.  Try a few different grid resolutions (how many cubes in x, how many cubes in z) and 
    make sure your performance is good.   (3D transform: translation) 

    - Create an algorithm to scale the cube models in the grid in the dimension orthogonal to the plane 
    (the y dimension, which is orthogonal to the x-z plane).  Initially you can use random numbers or a procedure 
    of your choice.  (3D transform: scaling)  

    - Assign the vertices of the cubes some initial colors, using a procedure you create.  Note how the fragment shader 
    interpolates color between the vertices. 

    - Create a camera path that updates, where the camera points towards to center of the landscape (such as 'look at 0,0,0'), 
    and rotates around this look at point.  
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
 
    const BROWN = [0.45, 0.30, 0.15];
    const GREEN = [0.30, 0.75, 0.25];
    const faceBrightness = [0.8, 0.6, 1.0, 0.4, 0.7, 0.5];   // front, back, top, bottom, right, left
 
    const colors = [];
    for (let f = 0; f < 6; f++) {
        for (let v = 0; v < 4; v++) {
            const t = positions[(f * 4 + v) * 3 + 1] > 0 ? 1 : 0;
            for (let k = 0; k < 3; k++) {
                colors.push((BROWN[k] + (GREEN[k] - BROWN[k]) * t) * faceBrightness[f]);
            }
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
 
    const GRID_SIZE = 64;
    const SPACING = 2;
 
    function modelMatrix(x, height, z) {
        const sx = SPACING / 2, sy = height / 2, sz = SPACING / 2;
        return new Float32Array([
            sx, 0,  0,  0,
            0,  sy, 0,  0,
            0,  0,  sz, 0,
            x,  height / 2, z, 1
        ]);
    }
 
    const cubes = [];
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const x = (col - (GRID_SIZE - 1) / 2) * SPACING;
            const z = (row - (GRID_SIZE - 1) / 2) * SPACING;
            const height = 0.5 + Math.random() * 4;
            const shade = 0.8 + 0.2 * Math.random();
            cubes.push({
                model: modelMatrix(x, height, z),
                color: [shade, shade, shade]
            });
        }
    }
 
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
 
    window.Levels.level1 = {
        init(gl) {
            program = gl.createProgram();
            gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexShaderSource));
            gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentShaderSource));
            gl.linkProgram(program);
 
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