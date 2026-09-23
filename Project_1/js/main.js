// which render is active
let currentLevel = 1;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// level buttons
// clicking one switches the active level and redraws it.
document.querySelectorAll('button[data-level]').forEach(btn => {
    btn.addEventListener('click', () => {
        currentLevel = parseInt(btn.dataset.level, 10);
        render();
    });
});


// clear canvas and render based on current level
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (currentLevel === 1) {
        drawLevel1();
    } else if (currentLevel === 2) {
        drawLevel2();
    } else if (currentLevel === 3) {
        drawLevel3();
    }
}

// keyboard controls
// w / s : move forward / backward
// a / d : move left / right
// r : reset scene
// ArrowLeft / ArrowRight : turn left / turn right (10 degrees)
document.addEventListener("keydown", (event) => {
    event.preventDefault();

    switch (event.key) {
    case "ArrowLeft":
        for(let i = 0; i < instances.length; i++) {
            instances[i].rotation += 10;
        }
        render();
        break;
    case "ArrowRight":
        for(let i = 0; i < instances.length; i++) {
            instances[i].rotation -= 10;
        }
        render();
        break;
    case "w":
        for(let i = 0; i < instances.length; i++) {
            const rad = instances[i].rotation * Math.PI / 180;
            instances[i].position.x += Math.sin(rad) * 0.25;
            instances[i].position.z += -Math.cos(rad) * 0.25;
        }
        render();
        break;
    case "s":
        for(let i = 0; i < instances.length; i++) {
            const rad = instances[i].rotation * Math.PI / 180;
            instances[i].position.x -= Math.sin(rad) * 0.25;
            instances[i].position.z -= -Math.cos(rad) * 0.25;
        }
        render();
        break;
    case "a":
        for(let i = 0; i < instances.length; i++) {
            const rad = instances[i].rotation * Math.PI / 180;
            instances[i].position.x += Math.cos(rad) * 0.25;
            instances[i].position.z += Math.sin(rad) * 0.25;
        }
        
        render();
        break;
    case "d":
        for(let i = 0; i < instances.length; i++) {
            const rad = instances[i].rotation * Math.PI / 180;
            instances[i].position.x -= Math.cos(rad) * 0.25;
            instances[i].position.z -= Math.sin(rad) * 0.25;
        }
        render();
        break;
    case "r":
        instances = initalizeScene();
        render();
        break;
    default:
        return;
    }
});

// canvas sizing
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();