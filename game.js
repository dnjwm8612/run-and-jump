const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player (Rabbit)
const player = {
    x: 50,
    y: 230,
    width: 40,
    height: 40,
    vy: 0,
    jumpPower: -12,
    gravity: 0.7,
    onGround: true,
    jumpCount: 0,
    maxJump: 2 // double jump
};

// Obstacle
let obstacles = [];
let obstacleTimer = 0;
let obstacleInterval = 90;

// Background clouds
let clouds = [
    {x: 100, y: 60, w: 60, h: 30, speed: 1},
    {x: 400, y: 40, w: 80, h: 35, speed: 0.7},
    {x: 250, y: 90, w: 50, h: 25, speed: 1.2}
];

// Score
let score = 0;
let gameOver = false;

function resetGame() {
    player.y = 230;
    player.vy = 0;
    player.onGround = true;
    player.jumpCount = 0;
    obstacles = [];
    obstacleTimer = 0;
    score = 0;
    gameOver = false;
    clouds = [
        {x: 100, y: 60, w: 60, h: 30, speed: 1},
        {x: 400, y: 40, w: 80, h: 35, speed: 0.7},
        {x: 250, y: 90, w: 50, h: 25, speed: 1.2}
    ];
}

function spawnObstacle() {
    // 30% 확률로 높은 장애물(이단 점프 필요)
    if (Math.random() < 0.3) {
        obstacles.push({
            x: canvas.width,
            y: 210,
            width: 40,
            height: 90,
            speed: 6
        });
    } else {
        obstacles.push({
            x: canvas.width,
            y: 250,
            width: 20 + Math.random() * 20,
            height: 50,
            speed: 6
        });
    }
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
        player.jumpCount = 0;
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

    // Clouds (background)
    clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.w < 0) {
            cloud.x = canvas.width + Math.random() * 100;
            cloud.y = 30 + Math.random() * 80;
        }
    });

    // Score
    if (!gameOver) score++;
}

function drawRabbit(x, y, w, h) {
    // Body
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + w*0.15, y + h*0.3, w*0.7, h*0.6);
    // Head
    ctx.beginPath();
    ctx.ellipse(x + w/2, y + h*0.3, w*0.28, h*0.22, 0, 0, Math.PI*2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    // Ears
    ctx.beginPath();
    ctx.ellipse(x + w*0.35, y + h*0.05, w*0.09, h*0.22, 0, 0, Math.PI*2);
    ctx.ellipse(x + w*0.65, y + h*0.05, w*0.09, h*0.22, 0, 0, Math.PI*2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    // Eyes
    ctx.beginPath();
    ctx.arc(x + w*0.42, y + h*0.32, w*0.03, 0, Math.PI*2);
    ctx.arc(x + w*0.58, y + h*0.32, w*0.03, 0, Math.PI*2);
    ctx.fillStyle = '#222';
    ctx.fill();
    // Nose
    ctx.beginPath();
    ctx.arc(x + w/2, y + h*0.37, w*0.03, 0, Math.PI*2);
    ctx.fillStyle = '#f99';
    ctx.fill();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw sky
    ctx.fillStyle = '#b7eaff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw clouds
    clouds.forEach(cloud => {
        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.w/2, cloud.h/2, 0, 0, Math.PI*2);
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
    });

    // Draw ground
    ctx.fillStyle = '#88c070';
    ctx.fillRect(0, 270, canvas.width, 30);

    // Draw player (rabbit)
    drawRabbit(player.x, player.y, player.width, player.height);

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
        } else if (player.jumpCount < player.maxJump) {
            player.vy = player.jumpPower;
            player.jumpCount++;
        }
    }
});

resetGame();
gameLoop();
