// what wwas painted to the canvas last time
const prevScreenArray = [];
// depth array
// keeps track of the z of the closest surface drawn so far
const depthArray = [];

let skyColor = "#87ceeb";
let grassColor = "#4a8f2a";

// Allocate the per pixel arrays
for (let y = 0; y < rows; y++) {
    screenArray[y] = new Array(cols).fill(backgroundColor);
    prevScreenArray[y] = new Array(cols).fill(null);
    depthArray[y] = new Float32Array(cols);
}

function drawLevel3() {
    // reet buffers for this frame
    for (let y = 0; y < rows; y++) {
        // sky above the horizon line, grass below it
        screenArray[y].fill(y < rows / 2.3 ? skyColor : grassColor);
        prevScreenArray[y] = new Array(cols).fill(null);
        // nothing has been drawn yet so everything is infinetly far away
        depthArray[y].fill(Infinity);
    }
    
    for (let instance of instances) {
        const shape = shapeLibrary[instance.type]
        let camVertices = [];

        for (let v = 0; v < shape.vertices.length; v++) {
            let worldVert = transformVertex(shape.vertices[v], instance);
            let rotatedVert = rotateVertex(worldVert, camera, instance.rotation);
            let camVert = worldToCamera(rotatedVert, camera);
            camVertices.push(camVert);
        }

        for (let t = 0; t < shape.triangles.length; t++) {
            let edges = shape.triangles[t].verts;

            let camA = camVertices[edges[0]];
            let camB = camVertices[edges[1]];
            let camC = camVertices[edges[2]];

            // near plane clipping can return 0-2 triangles
            let clipped = clipTriangle(camA, camB, camC);
            if(clipped.length === 0) continue;

            for (let tri of clipped) {
                let screenA = cameraToScreen(tri[0], canvas);
                let screenB = cameraToScreen(tri[1], canvas);
                let screenC = cameraToScreen(tri[2], canvas);

                let u1 = screenA.u / scaleX;
                let v1 = (canvas.height - screenA.v) / scaleY;

                let u2 = screenB.u / scaleX;
                let v2 = (canvas.height - screenB.v) / scaleY;

                let u3 = screenC.u / scaleX;
                let v3 = (canvas.height - screenC.v) / scaleY;


                // keep  each corners depth for the depth test
                let z1 = tri[0].z;
                let z2 = tri[1].z;
                let z3 = tri[2].z;
                
                fillTriangle(u1, v1, z1, u2, v2, z2, u3, v3, z3, shape.triangles[t].color);
            }
        }
    }

    // Iterate through the array and draw the color for each pixel
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            // Set color of this pixel if its not backround change it
            const color = screenArray[y][x];
            // skip pixels that already show this color
            if (color === prevScreenArray[y][x]) {
                continue;
            }
            ctx.fillStyle = color;
            // Scale each pixel so that it looks like 320x200 resolution
            ctx.fillRect(x * scaleX, y * scaleY, scaleX, scaleY);
            prevScreenArray[y][x] = color;
        }
    }
}

// Set a specific pixel to a given color
function setPixel3(x, y, color) {
    x = Math.round(x);
    y = Math.round(y);

    if (x < 0 || x >= cols || y < 0 || y >= rows) {
        return;
    }

    screenArray[y][x] = color;
}

function fillTriangle (u1, v1, z1, u2, v2, z2, u3, v3, z3, color) {
    // find the bounding box of the triangle
    let uMin = Math.max(0, Math.floor(Math.min(u1, u2, u3)));
    let uMax = Math.min(cols - 1, Math.ceil(Math.max(u1, u2, u3)));
    let vMin = Math.max(0, Math.floor(Math.min(v1, v2, v3)));
    let vMax = Math.min(rows - 1, Math.ceil(Math.max(v1, v2, v3)));

    // twice the signed area
    // zero means the triange is a line or a point
    const area = (u2 - u1) * (v3 - v1) - (v2 - v1) * (u3 - u1);
    if (area === 0) {
        return;
    }
    
    for (let px = uMin; px <= uMax; px++) {
        for (let py = vMin; py <= vMax; py++) {

            // edge function
            // which side of each edge this pixel is on
            let edge1 = (u2 - u1) * (py - v1) - (v2 - v1) * (px - u1);
            let edge2 = (u3 - u2) * (py - v2) - (v3 - v2) * (px - u2);
            let edge3 = (u1 - u3) * (py - v3) - (v1 - v3) * (px - u3);

            // inside if all signs match (clockwisw or counterclockwise)
            let inside1 = edge1 >= 0 && edge2 >= 0 && edge3 >= 0;
            let inside2 = edge1 <= 0 && edge2 <= 0 && edge3 <= 0;

            if (inside1 || inside2) {
                // barycentric weights to interpolated depth
                let w1 = edge2 / area;
                let w2 = edge3 / area;
                let w3 = edge1 / area;
                let depth = w1 * z1 + w2 * z2 + w3 * z3;

                if (px < 0 || px >= cols || py < 0 || py >= rows) {
                    continue;
                }

                // depth test
                // keep the nearest surface
                if (depth < depthArray[py][px]) {
                    depthArray[py][px] = depth;
                    setPixel3(px, py, color);
                }
            }
        }
    }
}