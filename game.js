const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player
const player = {
    x: 50,
    y: 230,
    width: 40,
    height: 40,
    vy: 0,
    jumpPower: -12,
    gravity: 0.7,
    onGround: true
};

// Obstacle
let obstacles = [];
let obstacleTimer = 0;
let obstacleInterval = 90;

// Score
let score = 0;
let gameOver = false;

function resetGame() {
    player.y = 230;
    player.vy = 0;
    player.onGround = true;
    obstacles = [];
    obstacleTimer = 0;
    score = 0;
    gameOver = false;
}

function spawnObstacle() {
    obstacles.push({
        x: canvas.width,
        y: 250,
        width: 20 + Math.random() * 20,
        height: 50,
        speed: 6
    });
}

function update() {
    if (gameOver) return;

    // Player physics
    player.vy += player.gravity;
    player.y += player.vy;
    if (player.y >= 230) {
        player.y = 230;
        player.vy = 0;
        player.onGround = true;
    } else {
        player.onGround = false;
    }

    // Obstacles
    obstacleTimer++;
    if (obstacleTimer > obstacleInterval) {
        spawnObstacle();
        obstacleTimer = 0;
        obstacleInterval = 60 + Math.random() * 60;
    }
    obstacles.forEach(ob => ob.x -= ob.speed);
    obstacles = obstacles.filter(ob => ob.x + ob.width > 0);

    // Collision
    obstacles.forEach(ob => {
        if (
            player.x < ob.x + ob.width &&
            player.x + player.width > ob.x &&
            player.y < ob.y + ob.height &&
            player.y + player.height > ob.y
        ) {
            gameOver = true;
        }
    });

    // Score
    if (!gameOver) score++;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#888';
    ctx.fillRect(0, 270, canvas.width, 30);

    // Draw player
    ctx.fillStyle = '#3498db';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw obstacles
    ctx.fillStyle = '#e74c3c';
    obstacles.forEach(ob => {
        ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
    });

    // Draw score
    ctx.fillStyle = '#222';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 20, 40);

    // Draw game over
    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '36px Arial';
        ctx.fillText('Game Over', canvas.width/2 - 90, canvas.height/2 - 10);
        ctx.font = '24px Arial';
        ctx.fillText('Press Space to Restart', canvas.width/2 - 120, canvas.height/2 + 30);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        if (gameOver) {
            resetGame();
        } else if (player.onGround) {
            player.vy = player.jumpPower;
        }
    }
});

resetGame();
gameLoop();
