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

  // 3인칭 러너 시점: 캐릭터에서 멀리, 높게 위치
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(5, 10, 0); // 캐릭터에서 멀리, 높게 위치
  camera.lookAt(-10, 1, 0);

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

  // Player (rabbit)
  const playerGeo = new THREE.Group();

  // 몸통
  const bodyGeo = new THREE.CylinderGeometry(0.4, 0.5, 1.2, 16);
  const bodyMat = new THREE.MeshPhongMaterial({color: 0xffffff});
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.6;
  playerGeo.add(body);

  // 머리
  const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
  const headMat = new THREE.MeshPhongMaterial({color: 0xffffff});
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.25;
  playerGeo.add(head);

  // 귀
  const earGeo = new THREE.CylinderGeometry(0.09, 0.12, 0.6, 12);
  const earMat = new THREE.MeshPhongMaterial({color: 0xffffff});
  const earL = new THREE.Mesh(earGeo, earMat);
  const earR = new THREE.Mesh(earGeo, earMat);
  earL.position.set(-0.15, 1.7, 0);
  earR.position.set(0.15, 1.7, 0);
  earL.rotation.z = Math.PI/16;
  earR.rotation.z = -Math.PI/16;
  playerGeo.add(earL);
  playerGeo.add(earR);

  // 코
  const noseGeo = new THREE.SphereGeometry(0.07, 8, 8);
  const noseMat = new THREE.MeshPhongMaterial({color: 0xffa0a0});
  const nose = new THREE.Mesh(noseGeo, noseMat);
  nose.position.set(0, 1.18, 0.33);
  playerGeo.add(nose);

  // 눈
  const eyeGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const eyeMat = new THREE.MeshPhongMaterial({color: 0x222222});
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.13, 1.29, 0.32);
  eyeR.position.set(0.13, 1.29, 0.32);
  playerGeo.add(eyeL);
  playerGeo.add(eyeR);

  player = playerGeo;
  player.position.set(-5, 0.5, 0);
  player.rotation.y = Math.PI / 2; // 반대방향(음수 x축) 바라보게 회전
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
  // 50% 확률로 늑대(점프 장애물) 또는 새(점프하면 안되는 장애물) 생성
  if (Math.random() < 0.5) {
    // 늑대(점프해야 함, 바닥)
    const wolf = new THREE.Group();
    // 몸통
    const bodyGeo = new THREE.BoxGeometry(1, 0.6, 0.5);
    const bodyMat = new THREE.MeshPhongMaterial({color: 0x888888});
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.3;
    wolf.add(body);
    // 머리
    const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const headMat = new THREE.MeshPhongMaterial({color: 0x888888});
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0.4, 0.55, 0);
    wolf.add(head);
    // 귀
    const earGeo = new THREE.ConeGeometry(0.11, 0.2, 8);
    const earMat = new THREE.MeshPhongMaterial({color: 0x444444});
    const earL = new THREE.Mesh(earGeo, earMat);
    const earR = new THREE.Mesh(earGeo, earMat);
    earL.position.set(0.55, 0.8, -0.12);
    earR.position.set(0.55, 0.8, 0.12);
    wolf.add(earL);
    wolf.add(earR);
    // 코
    const noseGeo = new THREE.SphereGeometry(0.07, 8, 8);
    const noseMat = new THREE.MeshPhongMaterial({color: 0x222222});
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0.65, 0.5, 0);
    wolf.add(nose);
    // 눈
    const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const eyeMat = new THREE.MeshPhongMaterial({color: 0xffffff});
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(0.55, 0.6, -0.13);
    eyeR.position.set(0.55, 0.6, 0.13);
    wolf.add(eyeL);
    wolf.add(eyeR);
    wolf.position.set(12, 0.3, 0);
    wolf.userData = {type: 'wolf', height: 0.8};
    scene.add(wolf);
    obstacles.push(wolf);
  } else {
    // 새(점프하면 안됨, 공중)
    const bird = new THREE.Group();
    // 몸통
    const bodyGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const bodyMat = new THREE.MeshPhongMaterial({color: 0x3399ff});
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.2;
    bird.add(body);
    // 날개
    const wingGeo = new THREE.BoxGeometry(0.5, 0.08, 0.18);
    const wingMat = new THREE.MeshPhongMaterial({color: 0x3399ff});
    const wingL = new THREE.Mesh(wingGeo, wingMat);
    const wingR = new THREE.Mesh(wingGeo, wingMat);
    wingL.position.set(-0.3, 1.2, 0);
    wingR.position.set(0.3, 1.2, 0);
    bird.add(wingL);
    bird.add(wingR);
    // 부리
    const beakGeo = new THREE.ConeGeometry(0.07, 0.18, 8);
    const beakMat = new THREE.MeshPhongMaterial({color: 0xffcc00});
    const beak = new THREE.Mesh(beakGeo, beakMat);
    beak.position.set(0, 1.18, 0.32);
    beak.rotation.x = Math.PI/2;
    bird.add(beak);
    // 눈
    const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const eyeMat = new THREE.MeshPhongMaterial({color: 0x222222});
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.09, 1.28, 0.23);
    eyeR.position.set(0.09, 1.28, 0.23);
    bird.add(eyeL);
    bird.add(eyeR);
    bird.position.set(12, 1.2, 0);
    bird.userData = {type: 'bird', height: 1.2};
    scene.add(bird);
    obstacles.push(bird);
  }
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
      if (obs.userData.type === 'wolf') {
        // 늑대: 바닥에 있을 때만 충돌
        if (
          Math.abs(player.position.x - obs.position.x) < 0.8 &&
          player.position.y < 0.9
        ) {
          gameOver = true;
          gameoverDiv.style.display = "block";
        }
      } else if (obs.userData.type === 'bird') {
        // 새: 점프 중일 때만 충돌
        if (
          Math.abs(player.position.x - obs.position.x) < 0.8 &&
          player.position.y > 0.9
        ) {
          gameOver = true;
          gameoverDiv.style.display = "block";
        }
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
      jumpVelocity = 2; // 점프력 2로 수정
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
