/* 
Project Preliminaries
    - Create a web application using html, ccs, javascript, and webgl
    - A portion of this page (a header) should give a title , your name and have space for information about your project
    - Display a single cube of dimentions 2x2x2 in your scene
*/

window.Levels = window.Levels || {};   // make sure the shared object exists
 
(function () {
    const vertexShaderSource = `
        attribute vec3 aPosition;
        attribute vec4 aColor;
        uniform mat4 uView;
        uniform mat4 uProj;
        varying vec4 vColor;
        void main() {
            vColor = aColor;
            gl_Position = uProj * uView * vec4(aPosition, 1.0);
        }`;
 
    const fragmentShaderSource = `
        precision mediump float;
        varying vec4 vColor;
        void main() { 
            gl_FragColor = vColor; 
        }`;
 
    const positions = [
        // Front face
        -1.0, -1.0,  1.0,   1.0, -1.0,  1.0,   1.0,  1.0,  1.0,  -1.0,  1.0,  1.0,
        // Back face
        -1.0, -1.0, -1.0,  -1.0,  1.0, -1.0,   1.0,  1.0, -1.0,   1.0, -1.0, -1.0,
        // Top face
        -1.0,  1.0, -1.0,  -1.0,  1.0,  1.0,   1.0,  1.0,  1.0,   1.0,  1.0, -1.0,
        // Bottom face
        -1.0, -1.0, -1.0,   1.0, -1.0, -1.0,   1.0, -1.0,  1.0,  -1.0, -1.0,  1.0,
        // Right face
        1.0, -1.0, -1.0,   1.0,  1.0, -1.0,   1.0,  1.0,  1.0,   1.0, -1.0,  1.0,
        // Left face
        -1.0, -1.0, -1.0,  -1.0, -1.0,  1.0,  -1.0,  1.0,  1.0,  -1.0,  1.0, -1.0
    ];
 
    const faceColors = [
        [1.0, 1.0, 1.0, 1.0], // Front: white
        [1.0, 0.0, 0.0, 1.0], // Back: red
        [0.0, 1.0, 0.0, 1.0], // Top: green
        [0.0, 0.0, 1.0, 1.0], // Bottom: blue
        [1.0, 1.0, 0.0, 1.0], // Right: yellow
        [1.0, 0.0, 1.0, 1.0]  // Left: purple
    ];
 
    let colors = [];
    for (const c of faceColors) colors = colors.concat(c, c, c, c);
 
    const indices = [
        0,  1,  2,   0,  2,  3,  // front
        4,  5,  6,   4,  6,  7,  // back
        8,  9, 10,   8, 10, 11,  // top
        12, 13, 14,  12, 14, 15, // bottom
        16, 17, 18,  16, 18, 19, // right
        20, 21, 22,  20, 22, 23  // left
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
 
    window.Levels.level0 = {
        // once: build the shader program and upload the cube to the GPU
        init(gl) {
            program = gl.createProgram();
            gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexShaderSource));
            gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentShaderSource));
            gl.linkProgram(program);
 
            posBuf = makeBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(positions));
            colBuf = makeBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(colors));
            idxBuf = makeBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices));
 
            // these names must match the names inside the shaders
            loc = {
                pos: gl.getAttribLocation(program, 'aPosition'),
                col: gl.getAttribLocation(program, 'aColor'),
                view: gl.getUniformLocation(program, 'uView'),
                proj: gl.getUniformLocation(program, 'uProj')
            };
        },
 
        // every frame: draw the cube using main.js's camera
        draw(gl, camera) {
            gl.useProgram(program);
 
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
            gl.vertexAttribPointer(loc.pos, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(loc.pos);
 
            gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
            gl.vertexAttribPointer(loc.col, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(loc.col);
 
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
 
            gl.uniformMatrix4fv(loc.view, false, camera.view);
            gl.uniformMatrix4fv(loc.proj, false, camera.proj);
 
            gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
        }
    };
})();