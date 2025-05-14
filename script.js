const game = document.getElementById("game");
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");
const pauseBtn = document.getElementById("pauseBtn");

let playerPos = 180;
let score = 0;
let gameOver = false;
let paused = false;
let keys = {};

let enemyInterval = 1000;
let enemySpeed = 5;
let lastEnemyTime = 0;
let lastScoreTime = 0;
let lastShotTime = 0;
const shotCooldown = 5000; // 5 segundos
let lastDashTime = 0;
const dashCooldown = 8000; // 8 segundos

// Sistema de movimento melhorado
document.addEventListener("keydown", (e) => {
  if (e.key === "p" || e.key === "P") {
    togglePause();
    return;
  }
  if (e.code === "Space") {
    keys["Space"] = true;
  } else {
    keys[e.key] = true;
    // Movimento imediato ao pressionar a tecla
    if (!gameOver && !paused) {
      if (e.key === "ArrowLeft" && playerPos > 0) {
        playerPos = Math.max(0, playerPos - 20);
      } else if (e.key === "ArrowRight" && playerPos < 360) {
        playerPos = Math.min(360, playerPos + 20);
      }
      player.style.left = playerPos + "px";
    }
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "Space") {
    keys["Space"] = false;
  } else {
    keys[e.key] = false;
  }
});

// Movimento suave do jogador
function updatePlayerPosition() {
  if (gameOver || paused) return;

  if (keys["ArrowUp"]) {
    shoot();
  }
  if (keys["Space"]) {
    dash();
  }

  requestAnimationFrame(updatePlayerPosition);
}

// Botão de pause
pauseBtn.addEventListener("click", togglePause);

function togglePause() {
  paused = !paused;
  pauseBtn.textContent = paused ? "Continuar" : "Pausar";
}

// Criar e animar um inimigo com requestAnimationFrame
function createEnemy() {
  const enemy = document.createElement("div");
  enemy.classList.add("enemy");
  enemy.style.left = Math.floor(Math.random() * 10) * 40 + "px";
  enemy.dataset.alive = "true";
  game.appendChild(enemy);

  let enemyTop = 0;

  function fall() {
    if (gameOver || enemy.dataset.alive === "false") {
      enemy.remove();
      return;
    }

    if (!paused) {
      enemyTop += enemySpeed;
      enemy.style.top = enemyTop + "px";

      // Verificação de colisão apenas na área visual do bloco
      if (enemyTop >= 460 && enemyTop <= 500) { // Verifica apenas quando o bloco está na área de colisão
        const enemyLeft = parseInt(enemy.style.left);
        const collisionDistance = Math.abs(enemyLeft - playerPos);
        
        if (
          enemy.dataset.alive === "true" &&
          collisionDistance < 35
        ) {
          endGame();
          return;
        }
      }

      if (enemyTop > 600) {
        enemy.remove();
        return;
      }
    }

    requestAnimationFrame(fall);
  }

  requestAnimationFrame(fall);
}

// Loop principal
function gameLoop() {
  const now = Date.now();

  if (!gameOver && !paused) {
    if (now - lastEnemyTime > enemyInterval) {
      createEnemy();
      lastEnemyTime = now;
    }

    if (now - lastScoreTime > 500) {
      score++;
      scoreDisplay.textContent = "Pontos: " + score;
      lastScoreTime = now;

      // Ajuste na dificuldade mais gradual
      if (score % 10 === 0 && enemyInterval > 300) {
        enemyInterval -= 30; // Reduzido de 50 para 30
        enemySpeed += 0.5; // Reduzido de 1 para 0.5
      }
    }
  }

  requestAnimationFrame(gameLoop);
}

// Fim de jogo
function endGame() {
  gameOver = true;
  alert("Fim de jogo! Pontuação: " + score);
  location.reload();
}

// Start
requestAnimationFrame(gameLoop);
requestAnimationFrame(updatePlayerPosition);

// função shoot
function shoot() {
    const now = Date.now();
    if (now - lastShotTime < shotCooldown) return;
  
    lastShotTime = now;
  
    player.classList.add("cooldown");
  
    setTimeout(() => {
      player.classList.remove("cooldown");
    }, shotCooldown);
  
    const bullet = document.createElement("div");
    bullet.classList.add("bullet");
    bullet.style.left = playerPos + 15 + "px";
    bullet.style.bottom = "50px";
    game.appendChild(bullet);
  
    let bulletPos = 50;
  
    function moveBullet() {
      if (gameOver || paused) {
        requestAnimationFrame(moveBullet);
        return;
      }
  
      bulletPos += 10;
      bullet.style.bottom = bulletPos + "px";
  
      if (bulletPos > 600) {
        bullet.remove();
        return;
      }
  
      const enemies = document.querySelectorAll(".enemy");
      enemies.forEach((enemy) => {
        if (enemy.dataset.alive !== "true") return;
  
        const bulletRect = bullet.getBoundingClientRect();
        const enemyRect = enemy.getBoundingClientRect();
  
        if (
          bulletRect.top < enemyRect.bottom &&
          bulletRect.bottom > enemyRect.top &&
          bulletRect.left < enemyRect.right &&
          bulletRect.right > enemyRect.left
        ) {
          enemy.dataset.alive = "false";
          enemy.remove();
          bullet.remove();
        }
      });
  
      requestAnimationFrame(moveBullet);
    }
  
    requestAnimationFrame(moveBullet);
  }
  
  function dash() {
    const now = Date.now();
    if (now - lastDashTime < dashCooldown) return;
  
    lastDashTime = now;
  
    player.classList.add("dash-cooldown");
    setTimeout(() => {
      player.classList.remove("dash-cooldown");
    }, dashCooldown);
  
    if (playerPos <= 280) {
      playerPos += 80;
    } else if (playerPos >= 80) {
      playerPos -= 80;
    }
    player.style.left = playerPos + "px";
  }
  