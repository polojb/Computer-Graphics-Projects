// flat 2x2 square on the ground
function makePath() {
    const vertices = 
    [
        { x: 1, y: 0, z: 1 },
        { x: 1, y: 0, z: -1 },
        { x: -1, y: 0, z: -1 },
        { x: -1, y: 0, z: 1 },
    ];

    const edges =
    [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [0, 2], [1, 3],
    ];

    const triangles = 
    [
        {verts: [0,1,2], color: "#a84600"},
        {verts: [0,2,3], color: "#a84600"},
    ];

    return {vertices, edges, triangles}
}

// 2x2x2 box sitting on the ground
function makeCube() {
    const vertices = 
    [
        { x: 1, y: 0, z: 1 },
        { x: 1, y: 0, z: -1 },
        { x: -1, y: 0, z: -1 },
        { x: -1, y: 0, z: 1 },
        { x: 1, y: 2, z: 1 },
        { x: 1, y: 2, z: -1 },
        { x: -1, y: 2, z: -1 },
        { x: -1, y: 2, z: 1 },
    ];

    const edges =
    [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],

        [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    const triangles = 
    [
        {verts: [0,1,2], color: "#3a7a1f"}, {verts: [0,2,3], color: "#3a7a1f"},
        {verts: [4,5,6], color: "#3a7a1f"}, {verts: [4,6,7], color: "#3a7a1f"},

        {verts: [0,1,4], color: "#3bc400"}, {verts: [4,1,5], color: "#3bc400"},
        {verts: [3,2,6], color: "#226c00"}, {verts: [3,6,7], color: "#226c00"},

        {verts: [1,2,5], color: "#81ff4b"}, {verts: [2,5,6], color: "#81ff4b"},
        {verts: [0,3,4], color: "#227200"}, {verts: [3,4,7], color: "#227200"},
    ];

    return {vertices, edges, triangles}
}

// tall 2x10x2 box
function makeTreeTrunk() {
    const vertices = 
    [
        { x: 1, y: 0, z: 1 },
        { x: 1, y: 0, z: -1 },
        { x: -1, y: 0, z: -1 },
        { x: -1, y: 0, z: 1 },

        { x: 1, y: 10, z: 1 },
        { x: 1, y: 10, z: -1 },
        { x: -1, y: 10, z: -1 },
        { x: -1, y: 10, z: 1 },
    ];

    const edges =
    [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],

        [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    const triangles = 
    [
        {verts: [0,1,2], color: "#d98a00"}, {verts: [0,2,3], color: "#d98a00"},
        {verts: [4,5,6], color: "#5c3b00"}, {verts: [4,6,7], color: "#5c3b00"},

        {verts: [0,1,4], color: "#6e4700"}, {verts: [4,1,5], color: "#6e4700"},
        {verts: [3,2,6], color: "#f0a020"}, {verts: [3,6,7], color: "#f0a020"},

        {verts: [1,2,5], color: "#b47500"}, {verts: [2,5,6], color: "#b47500"},
        {verts: [0,3,4], color: "#8c5b00"}, {verts: [3,4,7], color: "#8c5b00"},
    ];

    return {vertices, edges, triangles}
}


// two stacked square pyramids
function makeTreeTop() {
    const vertices = 
    [
        { x: 6, y: 0, z: 6 },
        { x: 6, y: 0, z: -6 },
        { x: -6, y: 0, z: -6 },
        { x: -6, y: 0, z: 6 },

        { x: 0, y: 10, z: 0 },

        { x: 5, y: 3, z: 5 },
        { x: 5, y: 3, z: -5 },
        { x: -5, y: 3, z: -5 },
        { x: -5, y: 3, z: 5 },
        
        { x: 0, y: 13, z: 0 },
    ];

    const edges =
    [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [0, 4], [1, 4], [2, 4], [3, 4],

        [5, 6], [6, 7], [7, 8], [8, 5],
        [5, 9], [6, 9], [7, 9], [8, 9],
    ];

    const triangles = 
    [
        {verts: [0,1,4], color: "#28b600"}, {verts: [1,2,4], color: "#28b600"},
        {verts: [2,3,4], color: "#28b600"}, {verts: [0,3,4], color: "#28b600"},

        {verts: [0,1,2], color: "#1a7900"}, {verts: [1,2,3], color: "#1a7900"},

        {verts: [5,6,9], color: "#28b600"}, {verts: [6,7,9], color: "#28b600"},
        {verts: [7,8,9], color: "#28b600"}, {verts: [5,8,9], color: "#28b600"},

        {verts: [5,6,7], color: "#1a7900"}, {verts: [6,7,8], color: "#1a7900"},
    ];

    return {vertices, edges, triangles}
}

// single square pyramid
function makeMountain() {
    const vertices = 
    [
        { x: 1, y: 0, z: 1 },
        { x: 1, y: 0, z: -1 },
        { x: -1, y: 0, z: -1 },
        { x: -1, y: 0, z: 1 },
        { x: 0, y: 2, z: 0 },
    ];

    const edges = 
    [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [0, 4], [1, 4], [2, 4], [3, 4],
    ];

    const triangles = 
    [
        {verts: [0,1,4], color: "#b1aeab"}, {verts: [1,2,4], color: "#b1aeab"},
        {verts: [2,3,4], color: "#3f3d3a"}, {verts: [0,3,4], color: "#4c4b49"},

        {verts: [0,1,2], color: "#b1aeab"}, {verts: [1,2,3], color: "#b1aeab"},
    ];

    return {vertices, edges, triangles};
}

// every shape is built once here and shared by all instances of that type
const shapeLibrary = {
    path: makePath(),
    bush: makeCube(),
    treeTrunk: makeTreeTrunk(),
    treeTop: makeTreeTop(),
    mountain: makeMountain(),
};

// scales a vertex and then moves it to the instances position
function transformVertex(v, instance) {
    const s = instance.scale;

    return {
        x: v.x * s + instance.position.x,
        y: v.y * s + instance.position.y,
        z: v.z * s + instance.position.z,
    };
}

// rotate the world vertex around the cameras vertical axis
function rotateVertex(vert, camera, rotationDegrees) {
    const rad = rotationDegrees * Math.PI / 180;

    // position relative to the camera
    let px = vert.x - camera.x;
    let pz = vert.z - camera.z;

    // rotate in the x/z plane
    let x = (Math.cos(rad) * px) + (Math.sin(rad) * pz);
    let z = (-Math.sin(rad) * px) + (Math.cos(rad) * pz);

    // back to world coordinates
    return {
        x: x + camera.x,
        y: vert.y,
        z: z + camera.z,
    };
}