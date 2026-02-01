const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restart");

// Images
const marioImg = new Image();
const enemyImg = new Image();
const rewardImg = new Image();
const gubitnickaImg = new Image();

marioImg.src = "mario.png";
enemyImg.src = "enemy.png";
rewardImg.src = "reward.png";
gubitnickaImg.src = "gubitnicka.png";

// World
const worldWidth = 2400;
let cameraX = 0;

// Keyboard
const keys = {};
document.addEventListener("keydown", e => {
  if (e.code === "Space" || e.code.startsWith("Arrow")) e.preventDefault();
  keys[e.code] = true;

  if (e.code === "Space" && !mario.jumping) {
    mario.vy = -15;
    mario.jumping = true;
  }
});
document.addEventListener("keyup", e => keys[e.code] = false);

// Player
const mario = {
  x: 60,
  y: 480,
  w: 40,
  h: 40,
  vy: 0,
  jumping: false,
  speed: 5
};

// Platforms (IMPROVED)
const platforms = [
  { x: 0, y: 540, w: worldWidth, h: 60 }, // ground
  { x: 300, y: 420, w: 180, h: 20 },
  { x: 600, y: 350, w: 180, h: 20 },
  { x: 900, y: 280, w: 180, h: 20 },
  { x: 1200, y: 350, w: 180, h: 20 },
  { x: 1500, y: 420, w: 180, h: 20 },
  { x: 1800, y: 300, w: 200, h: 20 }
];

// Moving enemies (ground)
const enemies = [];
for (let i = 0; i < 6; i++) {
  enemies.push({
    x: 400 + i * 300,
    y: 500,
    w: 40,
    h: 40,
    speed: 2,
    dir: Math.random() > 0.5 ? 1 : -1
  });
}

// Static enemies on platforms
const staticEnemies = [
  { x: 340, y: 380, w: 40, h: 40 },
  { x: 640, y: 310, w: 40, h: 40 },
  { x: 940, y: 240, w: 40, h: 40 },
  { x: 1240, y: 310, w: 40, h: 40 },
  { x: 1840, y: 260, w: 40, h: 40 }
];

// Coins
const coins = [];
for (let i = 0; i < 12; i++) {
  coins.push({
    x: 350 + i * 160,
    y: 250 + (i % 2) * 60,
    r: 8,
    collected: false
  });
}

let score = 0;

// Reward (end)
// Reward (ON THE GROUND)
const reward = {
  x: worldWidth - 120,
  y: 500, // same height as ground enemies
  w: 40,
  h: 40
};
const gubitnicka = {
    x: worldWidth - 600,
    y: 600, 
    w: 600,
    h: 400
};

const gravity = 0.8;
let gameOver = false;
let win = false;

// Collision helpers
function rectCollide(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function circleRect(circle, rect) {
  return (
    circle.x + circle.r > rect.x &&
    circle.x - circle.r < rect.x + rect.w &&
    circle.y + circle.r > rect.y &&
    circle.y - circle.r < rect.y + rect.h
  );
}

function update() {
  if (gameOver || win) return;

  // Move
  if (keys["ArrowRight"] || keys["KeyD"]) mario.x += mario.speed;
  if (keys["ArrowLeft"] || keys["KeyA"]) mario.x -= mario.speed;

  // Gravity
  mario.vy += gravity;
  mario.y += mario.vy;

  mario.jumping = true;
  for (let p of platforms) {
    if (
      mario.x < p.x + p.w &&
      mario.x + mario.w > p.x &&
      mario.y + mario.h <= p.y + 12 &&
      mario.y + mario.h + mario.vy >= p.y
    ) {
      mario.y = p.y - mario.h;
      mario.vy = 0;
      mario.jumping = false;
    }
  }

  // Bounds
  if (mario.x < 0) mario.x = 0;
  if (mario.x + mario.w > worldWidth)
    mario.x = worldWidth - mario.w;

  // Camera
  cameraX = mario.x - canvas.width / 2;
  cameraX = Math.max(0, Math.min(cameraX, worldWidth - canvas.width));

  // Moving enemies
  for (let e of enemies) {
    e.x += e.speed * e.dir;
    if (e.x < 0 || e.x + e.w > worldWidth) e.dir *= -1;
    if (rectCollide(mario, e)) gameOver = true;
  }

  // Static enemies
  for (let se of staticEnemies) {
    if (rectCollide(mario, se)) gameOver = true;
  }

  // Coins
  for (let c of coins) {
    if (!c.collected && circleRect(c, mario)) {
      c.collected = true;
      score++;
    }
  }

  // Win
  if (rectCollide(mario, reward)) win = true;

  if (gameOver || win) restartBtn.style.display = "inline-block";
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(-cameraX, 0);

  // Platforms
  ctx.fillStyle = "#6b4f2a";
  for (let p of platforms) ctx.fillRect(p.x, p.y, p.w, p.h);

  // Coins
  ctx.fillStyle = "gold";
  for (let c of coins) {
    if (!c.collected) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Player
  ctx.drawImage(marioImg, mario.x, mario.y, mario.w, mario.h);

  // Enemies
  for (let e of enemies)
    ctx.drawImage(enemyImg, e.x, e.y, e.w, e.h);

  for (let se of staticEnemies)
    ctx.drawImage(enemyImg, se.x, se.y, se.w, se.h);
  ctx.drawImage(gubitnickaImg, gubitnicka.x, gubitnicka.y, gubitnicka.w, gubitnicka.h);
  // Reward
  ctx.drawImage(rewardImg, reward.x, reward.y, reward.w, reward.h);
  

  ctx.restore();

  // UI
  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.fillText(`Coins: ${score}`, 20, 40);

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "48px Arial";
    ctx.fillText("CRKO SI PICKO MRTVA MAJKU TI JEBEM TI BI NA MAESTRA", 470, 300);
    //tx.drawImage(gubitnickaImg, gubitnicka.x, gubitnicka.y, gubitnicka.w, gubitnicka.h);
  }

  if (win) {
    ctx.fillStyle = "gold";
    ctx.font = "48px Arial";
    ctx.fillText("PUSI KURAC MRTVU TI MAJKU JEBEM LIZI JOJ PICKU!", 500, 300);
  }
}

function restart() {
    location.reload();
}
restartBtn.onclick = () => restart(); 

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
