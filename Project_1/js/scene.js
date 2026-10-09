// The camera sits 3 units above the ground at the world origin
let camera = {x: 0, y: 3, z: 0};

// every object currently in the world
let instances = initalizeScene();

// random number in range [min, max)
function rand(min, max) {
    return min + Math.random() * (max - min);
}

// randomly returns -1 or 1
// used to put objects on the left or right side
function side() {
    return (Math.random() < 0.5 ? -1 : 1);
}

// build one instance object
function place(type, x, y, z, scale, rotation = 0 , color = 'white') {
    return { 
        type, 
        position: {x, y, z}, 
        scale, 
        rotation, 
        color,
        hueShift: rand(-15, 15),
        lightShift: rand(-8, 8) }
}

// creates a fresh random scene each time it is reset
function initalizeScene() {
    let list = [];

    //path
    for (let z = -100; z <= 100; z += 10) {
        list.push(place("path", 0, 0, z, 5, 0, '#a84600'))
    }
    //trees
    for (let i = 0; i <= 30; i++) {
        const x = side() * rand(10, 60);
        const z = rand(-80, 80);
        const s = rand(1, 1.6);
        list.push(place("treeTrunk", x, 0, z, s, 0, '#8c5b00'));
        list.push(place("treeTop", x, 4 * s, z, s, 0, '#28b600'));
    }
    //bushes
    for (let i = 0; i <= 40; i++) {
        list.push(place("bush", side() * rand(11, 50), 0, rand(-80, 80), rand(1, 2), 0, '#3a7a1f'));
    } 
    
    //mountains
    for (let z = -120; z <= 120; z += 30) {
        list.push(place("mountain", side() * rand(100, 130), 0, z, rand(25, 50), 0, '#b1aeab'));
    }
    for (let x = -90; x <= 90; x += 30) {
        list.push(place("mountain", x, 0, side() * rand(130, 150), rand(25, 50), 0, '#b1aeab'));
    }

    return list;
}