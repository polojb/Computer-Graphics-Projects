let backgroundColor = "black"

// virtual 320x200 screen
const screenArray = [];
const rows = 200;
const cols = 320;

// how many real canvas pixels one virtual pixel covers
const scaleX = canvas.width / cols;
const scaleY = canvas.height / rows;

// initialize a 2d array to ack as the lower resolution screen 
for (let i = 0; i < rows; i++) {
    screenArray[i] = [];
    for (let j = 0; j < cols; j++) {
        screenArray[i][j] = backgroundColor;
    }
}

function drawLevel2() {
    drawBackground();

    // Clear background 
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            screenArray[y][x] = backgroundColor;
        }
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

        for (let e = 0; e < shape.edges.length; e++) {
            //first vertex
            let e1 = shape.edges[e][0]; //idx
            let camA = camVertices[e1];
    
            //second vertex
            let e2 = shape.edges[e][1]; //idx
            let camB = camVertices[e2];

            let clipped = clipEdge(camA, camB);
            if(!clipped) continue;

            let screenA = cameraToScreen(clipped.p1, canvas);
            let screenB = cameraToScreen(clipped.p2, canvas);

            // Scale u and v so that it fits in 320x200 resolution
            let u1 = screenA.u / scaleX;
            let v1 = (canvas.height - screenA.v) / scaleY;

            let u2 = screenB.u / scaleX;
            let v2 = (canvas.height - screenB.v) / scaleY;

            drawLine2(u1, v1, u2, v2, "white");
        }
    }

    // Iterate through the array and draw the color for each pixel
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            // Set color of this pixel if its not backround change it
            const color = screenArray[y][x];
            // skip unchanged pixels
            if (color === backgroundColor) continue;
            ctx.fillStyle = color;
            // Scale each pixel so that it looks like 320x200 resolution
            ctx.fillRect(x * scaleX, y * scaleY, scaleX, scaleY);
        }
    }
}

// Set a specific pixel to a given color
function setPixel(x, y, color) {
    x = Math.round(x);
    y = Math.round(y);

    if (x < 0 || x >= cols || y < 0 || y >= rows) {
        return;
    }

    screenArray[y][x] = color;
}

// Bresenham's line algorithm
// https://www.geeksforgeeks.org/dsa/bresenhams-line-generation-algorithm/
function drawLine2(x0, y0, x1, y1, color = "white") {
    // round all points to the nearest integer
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);

    // find the disatnce between the two points
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);

    // find the direction that the line will take to get to the next point
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;

    // Keeps track of how far you are from the true line
    let error = dx + dy;

    let x = x0;
    let y = y0;

    while (true) {
        setPixel(x, y, color);

        // reached the end point
        if (x === x1 && y === y1) {
            break;
        }

        const errorTimes2 = error * 2;

        // step horizontally
        if (errorTimes2 >= dy) {
            error += dy;
            x += sx;
        }

        // step vertically
        if (errorTimes2 <= dx) {
            error += dx;
            y += sy;
        }
    }
}