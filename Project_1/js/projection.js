// moves the point so the camera is the origin
function worldToCamera(worldVert, camera) {
    return {
        x: worldVert.x - camera.x,
        y: worldVert.y - camera.y,
        z: worldVert.z - camera.z
    };
}

// pinhole projection
function cameraToScreen(camVert, canvas) {
    let u = camVert.x / camVert.z;
    let v = camVert.y / camVert.z;

    let scale = Math.min(canvas.width, canvas.height);
    u = u * scale + canvas.width / 2;
    v = v * scale + canvas.height / 2;

    return { u: u, v: v };
}

// clip a line segment against near plane (z <= near)
function clipEdge(camStart, camEnd) {
    const near = 0.1;
    const aVisable = camStart.z > near;
    const bVisable = camEnd.z > near;

    // both ends hidden
    // nothing to draw
    if(!aVisable && !bVisable) {
        return null;
    }

    let p1 = camStart;
    let p2 = camEnd;

    // cut the segment where it crosses z = near
    if (aVisable !== bVisable) {
        const t =(near - camStart.z) / (camEnd.z - camStart.z);
        // interpolation to find the crossing point
        const clipped = {
            x: camStart.x + t * (camEnd.x - camStart.x),
            y: camStart.y + t * (camEnd.y - camStart.y),
            z: near,
        };

        // replace whichever end was hidden
        if(aVisable) {
            p2 = clipped;
        }
        else {
            p1 = clipped;
        }
    }

    return {p1, p2};
}

// clip a triangle aginst the near plane
// returns an array of 0 - 2 trianges depending on how many vertices are in front of the camera
function clipTriangle (v1, v2, v3) {
    const near = 0.1;
    
    const in1 = v1.z > near;
    const in2 = v2.z > near;
    const in3 = v3.z > near;

    const insideCount = (in1 ? 1 : 0) + (in2 ? 1 : 0) + (in3 ? 1 : 0);

    // fully visible
    if (insideCount === 3) {
        return [[v1,v2,v3]];
    }

    // fully hidden
    if (insideCount === 0) {
        return[];
    }

    // one vertex in front
    if (insideCount === 1) {
        let inV, outV1, outV2;

        if (in1) {
            inV = v1;
            outV1 = v2;
            outV2 = v3;
        }
        else if (in2) {
            inV = v2;
            outV1 = v1;
            outV2 = v3;
        }
        else {
            inV = v3;
            outV1 = v1;
            outV2 = v2;
        }

        const p1 = intersect(outV1, inV);
        const p2 = intersect(outV2, inV);

        return [[inV, p1, p2]];
    }

    // two vertices in front
    if (insideCount === 2) {
        let inV1, inV2, outV;

        if (!in1) {
            outV = v1;
            inV1 = v2;
            inV2 = v3;
        }
        else if (!in2) {
            outV = v2;
            inV1 = v1;
            inV2 = v3;
        }
        else {
            outV = v3;
            inV1 = v1;
            inV2 = v2;
        }

        const p1 = intersect(outV, inV1);
        const p2 = intersect(outV, inV2);

        return [
            [inV1, inV2, p2],
            [inV1, p2, p1]
        ]
    }
}

// point where the edge from a hidden vertex to a visible one crosses the near plane
// since outV is the hidden end, clipEdge replaces p1 with it
function intersect(outV, inV) {
    const clipped = clipEdge(outV, inV);
    return clipped.p1;
}