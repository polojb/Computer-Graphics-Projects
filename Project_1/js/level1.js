// sky on top half of the canvas, grass on the bottom half.
// resused in level 2
function drawBackground() {
    // sky
    ctx.fillStyle = "#87ceeb";
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
    // grass
    ctx.fillStyle = "#4a8f2a";
    ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);
}

function drawLevel1() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    
    for (let instance of instances) {
        const shape = shapeLibrary[instance.type]

        // move every vertex of this shape into 2d camera space
        let camVertices = [];

        for (let v = 0; v < shape.vertices.length; v++) {
            let worldVert = transformVertex(shape.vertices[v], instance); // local -> world
            let rotatedVert = rotateVertex(worldVert, camera, instance.rotation); // apply rotation
            let camVert = worldToCamera(rotatedVert, camera); // world -> camera
            camVertices.push(camVert);
        }

        // project and draw each edge
        for (let e = 0; e < shape.edges.length; e++) {
            //first vertex
            let e1 = shape.edges[e][0]; //idx
            let camA = camVertices[e1];
    
            //second vertex
            let e2 = shape.edges[e][1]; //idx
            let camB = camVertices[e2];

            // cut off any part behind the camera
            // skip if nothing is on screen
            let clipped = clipEdge(camA, camB);
            if(!clipped) continue;

            // camera space -> screen space
            let screenA = cameraToScreen(clipped.p1, canvas);
            let screenB = cameraToScreen(clipped.p2, canvas);


            // flip v because the canvas y-axis goes down
            let u1 = screenA.u 
            let v1 = canvas.height - screenA.v;

            let u2 = screenB.u;
            let v2 = canvas.height - screenB.v;

            drawLine1(u1, v1, u2, v2);
        }
    }
}

// draw a 2px while line to the canvas
function drawLine1(x1, y1, x2, y2) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = "white";

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}