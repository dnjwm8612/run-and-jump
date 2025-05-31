// 3D Run and Jump Game with Three.js (시점 및 점프 개선)

let scene, camera, renderer, player, ground, obstacles = [];
let clock = new THREE.Clock();
let jumpVelocity = 0, gravity = -0.7, isJumping = false, canJump = true;
let jumpCount = 0;
const maxJumpCount = 2;
let score = 0, gameOver = false, obstacleTimer = 0, obstacleInterval = 1.2;
const scoreDiv = document.getElementById('score');
const gameoverDiv = document.getElementById('gameover');

// Init
function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xb7eaff);

  // 3인칭 러너 시점: 캐릭터 뒤에서 따라가는 카메라
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(-10.5, 6, 0); // 캐릭터 뒤쪽에서 1.5배 거리로 변경
  camera.lookAt(-5, 1, 0);

  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Light
  const light = new THREE.DirectionalLight(0xffffff, 1.2);
  light.position.set(10, 20, 10);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  // Ground
  const groundGeo = new THREE.BoxGeometry(40, 1, 8);
  const groundMat = new THREE.MeshPhongMaterial({color: 0x88c070});
  ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.set(0, -0.5, 0);
  scene.add(ground);

  // Player (cube)
  const playerGeo = new THREE.BoxGeometry(1, 1, 1);
  const playerMat = new THREE.MeshPhongMaterial({color: 0xffffff});
  player = new THREE.Mesh(playerGeo, playerMat);
  player.position.set(-5, 0.5, 0);
  scene.add(player);

  // Reset
  obstacles = [];
  score = 0;
  gameOver = false;
  jumpVelocity = 0;
  isJumping = false;
  canJump = true;
  obstacleTimer = 0;
  scoreDiv.innerText = "Score: 0";
  gameoverDiv.style.display = "none";
}

function spawnObstacle() {
  const h = Math.random() < 0.3 ? 2 : 1;
  const geo = new THREE.BoxGeometry(1, h, 1);
  const mat = new THREE.MeshPhongMaterial({color: 0xe74c3c});
  const obs = new THREE.Mesh(geo, mat);
  obs.position.set(12, h/2, 0);
  obs.userData = {height: h};
  scene.add(obs);
  obstacles.push(obs);
}

function resetObstacles() {
  for (let obs of obstacles) scene.remove(obs);
  obstacles = [];
}

function animate() {
  if (!gameOver) {
    let delta = clock.getDelta();
    // Player jump physics
    if (isJumping) {
      player.position.y += jumpVelocity * delta * 8;
      jumpVelocity += gravity * delta * 8;
      if (player.position.y <= 0.5) {
        player.position.y = 0.5;
        isJumping = false;
        canJump = true;
        jumpVelocity = 0;
        jumpCount = 0; // 바닥에 닿으면 점프 카운트 초기화
      }
    }

    // 카메라가 캐릭터를 따라가도록 위치 보정
    camera.position.y += ((player.position.y + 3.5) - camera.position.y) * 0.1;
    camera.lookAt(player.position.x + 2, player.position.y + 0.5, 0);

    // Obstacles move
    for (let obs of obstacles) {
      obs.position.x -= 8 * delta;
    }
    // Remove passed obstacles
    if (obstacles.length && obstacles[0].position.x < -14) {
      scene.remove(obstacles[0]);
      obstacles.shift();
    }

    // Spawn obstacle
    obstacleTimer += delta;
    if (obstacleTimer > obstacleInterval) {
      spawnObstacle();
      obstacleTimer = 0;
      obstacleInterval = 1 + Math.random() * 1.2;
    }

    // Collision
    for (let obs of obstacles) {
      if (
        Math.abs(player.position.x - obs.position.x) < 0.8 &&
        player.position.y < obs.userData.height + 0.1
      ) {
        gameOver = true;
        gameoverDiv.style.display = "block";
      }
    }

    // Score
    if (!gameOver) {
      score += Math.floor(delta * 60);
      scoreDiv.innerText = "Score: " + score;
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    if (gameOver) {
      resetObstacles();
      document.body.removeChild(renderer.domElement);
      init();
      animate();
    } else if (jumpCount < maxJumpCount) {
      isJumping = true;
      jumpVelocity = 1; // 점프력 1로 수정
      jumpCount++;
    }
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
animate();
