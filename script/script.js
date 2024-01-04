document.addEventListener("DOMContentLoaded", () => { 
    document.body.style.background = 'url(./img/forest1.png)'
});
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
const collisionCanvas = document.getElementById("collisionCanvas");
const collisionCtx = collisionCanvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;
//uint
let score = 299;
let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;
// let resultNano = 0;
//bool
let gameWin = false;
let gameOver = false;
// let gameWin = false;
//audio
const win = new Audio();
win.src = './audio/win.wav';
const newLvl = new Audio();
newLvl.src = './audio/levelUp.wav';
const scream1 = new Audio();
scream1.src = "./audio/scream1.wav";
const scream2 = new Audio();
scream2.src = "./audio/scream2.wav";
const scream3 = new Audio();
scream3.src = "./audio/scream3.wav";
const soundGameOver = new Audio();
soundGameOver.src = "./audio/gameOver.wav";
// const soundWin = new Audio();
// soundWin.src
//fontSize
ctx.font = "50px Impact";
//mass
let ravens = [];
let explosions = [];
let particles = [];
//classes
class Raven {
    constructor() {
        this.image = new Image();
        this.image.src = "./img/raven.png";
        this.sizeModifier = Math.random() * 0.6 + 0.4;
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 100;
        this.randomColors = [
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
        ];
        this.color =
            "rgb(" +
            this.randomColors[0] +
            "," +
            this.randomColors[1] +
            "," +
            this.randomColors[2] +
            ")";
        this.hasTrail = Math.random() > 0.5;
    }
    update(deltatime) {
        if (this.y < 0 || this.y > canvas.height - this.height) {
            this.directionY = this.directionY * -1;
        }
        this.x -= this.directionX;
        this.y += this.directionY;
        if (this.x < 0 - this.width) this.markedForDeletion = true;
        this.timeSinceFlap += deltatime;
        if (this.timeSinceFlap > this.flapInterval) {
            if (this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
            this.timeSinceFlap = 0;
            if (this.hasTrail) {
                particles.push(new Particle(this.x, this.y, this.width, "black"));
            }
        }
        if (this.x < 0 - this.width) gameOver = true;
        if (score === 500) this.delete;
    }
    draw() {
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(
            this.image,
            this.spriteWidth * this.frame,
            0,
            this.spriteWidth,
            this.spriteHeight,
            this.x,
            this.y,
            this.width,
            this.height
        );
    }
}

class Explosion {
    constructor(x, y, size) {
        this.image = new Image();
        this.image.src = "./img/boom.png";
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = "./audio/boom.wav";
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.markedForDeletion = false;
    }
    update(deltatime) {
        if (this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += deltatime;
        if (this.timeSinceLastFrame > this.frameInterval) {
            this.frame++;
            this.timeSinceLastFrame = 0;
            if (this.frame > 5) this.markedForDeletion = true;
        }
        if (score % 10 === 1) scream1.play();
        if (score % 50 === 1) scream2.play();
        if (score % 100 === 1) scream3.play();
    }
    draw() {
        ctx.drawImage(
            this.image,
            this.spriteWidth * this.frame,
            0,
            this.spriteWidth,
            this.spriteHeight,
            this.x,
            this.y,
            this.size,
            this.size
        );
    }
}

class Particle {
    constructor(x, y, size, color) {
        this.size = size;
        this.x = x + this.size / 2 + Math.random() * 50 - 25;
        this.y = y + this.size / 3 + Math.random() * 50 - 25;
        this.radius = (Math.random() * this.size) / 10;
        this.maxRadius = Math.random() * 20 + 35;
        this.markedForDeletion = false;
        this.speedX = Math.random() * 5 + 2.5;
        this.color = color;
    }
    update() {
        this.x += this.speedX;
        this.radius += 0.3;
        if (this.radius > this.maxRadius - 2) this.markedForDeletion = true;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = 1 - this.radius / this.maxRadius;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
//events
//restart event
document.addEventListener("click", (e) => {
    if (gameOver || gameWin) location.reload();
});

//boom event
window.addEventListener("click", (e) => {
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
    const pc = detectPixelColor.data;
    ravens.forEach((object) => {
        if (
            object.randomColors[0] === pc[0] &&
            object.randomColors[1] === pc[1] &&
            object.randomColors[2] === pc[2]
        ) {
            object.markedForDeletion = true;
            score++;
            explosions.push(new Explosion(object.x, object.y, object.width));
        }
    });
});
//functions
function drawScore(x, y) {
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + score, 53, 80);
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 50, 78);
}

function drawGameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
    soundGameOver.play();
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
    ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 1.75);
    ctx.fillStyle = "white";
    ctx.fillText("GAME OVER", canvas.width / 2 - 5, canvas.height / 2 + 5);
    ctx.fillText(
        "Score: " + score,
        canvas.width / 2 - 3,
        canvas.height / 1.75 + 3
    );
}
function drawWin() {
    if ( score === 300) {
        collisionCtx.clearRect(0,0, canvas.width, canvas.height);
        ctx.clearRect(0,0, canvas.width, canvas.height);
        ctx.textAlign = 'center';
        ctx.fillStyle = 'black';
        ctx.fillText('YOU WIN!!!', canvas.width/2, canvas.height/2);
        ctx.fillText('Score: ' + score, canvas.width/2, canvas.height/1.75);
        ctx.fillStyle = 'white';
        ctx.fillText('YOU WIN!!!', canvas.width/2 - 5, canvas.height/2 + 5);
        ctx.fillText('Score: ' + score, canvas.width/2 - 3, canvas.height/1.75 + 3);
    }
}

function removeBack(score) {
    if(score === 100) {
        newLvl.play();
        document.body.style.transition = "background 1s ease";
        document.body.style.background = 'url(./img/forest2.png)';
    }
    if (score === 200) {
        newLvl.play();
        document.body.style.transition = "background 1s ease";
        document.body.style.background = 'url(./img/forest3.png)';
    }
    if (score === 300) {
        win.play();
    }
}

function animate(timestamp) {
    if (!gameOver) {
    removeBack(score);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
    drawScore();
    let deltatime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextRaven += deltatime;
    if (timeToNextRaven > ravenInterval) {
        ravens.push(new Raven());
        timeToNextRaven = 0;
        ravens.sort((a, b) => {
            return a.width - b.width;
        });
    }
    [...particles, ...ravens, ...explosions].forEach(
        (object) => object.update(deltatime) & object.draw()
    );
    ravens = ravens.filter((object) => !object.markedForDeletion);
    explosions = explosions.filter((object) => !object.markedForDeletion);
    particles = particles.filter((object) => !object.markedForDeletion);
    if(score === 300) {
        gameWin = true;
        drawWin();
    }
    if(!gameWin) requestAnimationFrame(animate);
    }
    else drawGameOver();
}

animate(0);

