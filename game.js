// Tank Battle Game
// Main game logic

// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const gameOverModal = document.getElementById('game-over');
const levelCompleteModal = document.getElementById('level-complete');
const finalScoreElement = document.getElementById('final-score');
const levelScoreElement = document.getElementById('level-score');

// Game state
let score = 0;
let lives = 3;
let level = 1;
let gameRunning = true;
let gamePaused = false;
let soundEnabled = true;

// Game objects
let playerTank = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 40,
    height: 40,
    angle: 0, // in radians
    speed: 3,
    color: '#2ecc71',
    turretAngle: 0,
    lastShot: 0,
    shotDelay: 500 // milliseconds
};

let enemies = [];
let bullets = [];
let enemyBullets = [];
let obstacles = [];

// Keys state
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    ' ': false // space
};

// Sound elements
const shootSound = document.getElementById('shoot-sound');
const explosionSound = document.getElementById('explosion-sound');
const hitSound = document.getElementById('hit-sound');

// Initialize game
function init() {
    // Create obstacles
    createObstacles();

    // Create initial enemies
    createEnemies();

    // Set up event listeners
    setupEventListeners();

    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Create obstacles
function createObstacles() {
    obstacles = [];

    // Add some random obstacles
    for (let i = 0; i < 8; i++) {
        obstacles.push({
            x: 50 + Math.random() * (canvas.width - 100),
            y: 50 + Math.random() * (canvas.height - 100),
            width: 60 + Math.random() * 60,
            height: 60 + Math.random() * 60,
            color: '#7f8c8d'
        });
    }

    // Add border obstacles
    const borderWidth = 30;
    // Top
    obstacles.push({ x: 0, y: 0, width: canvas.width, height: borderWidth, color: '#34495e' });
    // Bottom
    obstacles.push({ x: 0, y: canvas.height - borderWidth, width: canvas.width, height: borderWidth, color: '#34495e' });
    // Left
    obstacles.push({ x: 0, y: 0, width: borderWidth, height: canvas.height, color: '#34495e' });
    // Right
    obstacles.push({ x: canvas.width - borderWidth, y: 0, width: borderWidth, height: canvas.height, color: '#34495e' });
}

// Create enemies
function createEnemies() {
    enemies = [];
    const enemyCount = 2 + level; // Increase enemies with level

    for (let i = 0; i < enemyCount; i++) {
        // Place enemies away from player
        let x, y;
        do {
            x = 100 + Math.random() * (canvas.width - 200);
            y = 100 + Math.random() * (canvas.height - 200);
        } while (distance(x, y, playerTank.x, playerTank.y) < 200);

        enemies.push({
            x: x,
            y: y,
            width: 40,
            height: 40,
            angle: Math.random() * Math.PI * 2,
            speed: 0.8 + level * 0.15,
            color: '#e74c3c',
            lastShot: 0,
            shotDelay: 2000 + Math.random() * 1500,
            targetAngle: Math.random() * Math.PI * 2,
            turnSpeed: 0.03
        });
    }
}

// Set up event listeners
function setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = false;
        }
    });

    // Button controls
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('sound-btn').addEventListener('click', toggleSound);
    document.getElementById('play-again-btn').addEventListener('click', restartGame);
    document.getElementById('next-level-btn').addEventListener('click', nextLevel);

    // Set GitHub link to actual repository
    const githubLink = document.getElementById('github-link');
    githubLink.href = 'https://github.com/sakura710/tank-battle';
    // Also store in localStorage for consistency
    localStorage.setItem('tankBattleRepoUrl', 'https://github.com/sakura710/tank-battle');
}

// Toggle pause state
function togglePause() {
    gamePaused = !gamePaused;
    const pauseBtn = document.getElementById('pause-btn');
    const icon = pauseBtn.querySelector('i');

    if (gamePaused) {
        pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
    } else {
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    }
}

// Toggle sound
function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundBtn = document.getElementById('sound-btn');
    const icon = soundBtn.querySelector('i');

    if (soundEnabled) {
        soundBtn.innerHTML = '<i class="fas fa-volume-up"></i> Sound';
    } else {
        soundBtn.innerHTML = '<i class="fas fa-volume-mute"></i> Sound';
    }
}

// Restart game
function restartGame() {
    score = 0;
    lives = 3;
    level = 1;
    gameRunning = true;
    gamePaused = false;

    playerTank.x = canvas.width / 2;
    playerTank.y = canvas.height / 2;
    playerTank.angle = 0;

    bullets = [];
    enemyBullets = [];

    updateUI();
    createObstacles();
    createEnemies();

    gameOverModal.style.display = 'none';
    levelCompleteModal.style.display = 'none';
}

// Next level
function nextLevel() {
    level++;
    playerTank.x = canvas.width / 2;
    playerTank.y = canvas.height / 2;
    playerTank.angle = 0;

    bullets = [];
    enemyBullets = [];

    updateUI();
    createObstacles();
    createEnemies();

    levelCompleteModal.style.display = 'none';
}

// Update UI elements
function updateUI() {
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    levelElement.textContent = level;
}

// Game over
function gameOver() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverModal.style.display = 'flex';
}

// Level complete
function levelComplete() {
    gamePaused = true;
    levelScoreElement.textContent = score;
    levelCompleteModal.style.display = 'flex';
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;

    if (!gamePaused) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update game state
        updatePlayer();
        updateEnemies();
        updateBullets();
        updateEnemyBullets();

        // Check collisions
        checkCollisions();

        // Draw everything
        drawObstacles();
        drawPlayer();
        drawEnemies();
        drawBullets();
        drawEnemyBullets();
    }

    requestAnimationFrame(gameLoop);
}

// Update player based on key presses
function updatePlayer() {
    // Calculate movement direction
    let moveX = 0;
    let moveY = 0;

    if (keys.ArrowUp) {
        moveX += Math.cos(playerTank.angle);
        moveY += Math.sin(playerTank.angle);
    }
    if (keys.ArrowDown) {
        moveX -= Math.cos(playerTank.angle);
        moveY -= Math.sin(playerTank.angle);
    }

    // Normalize diagonal movement
    if (moveX !== 0 || moveY !== 0) {
        const length = Math.sqrt(moveX * moveX + moveY * moveY);
        moveX /= length;
        moveY /= length;

        // Apply speed
        moveX *= playerTank.speed;
        moveY *= playerTank.speed;
    }

    // Rotation
    if (keys.ArrowLeft) {
        playerTank.angle -= 0.05;
    }
    if (keys.ArrowRight) {
        playerTank.angle += 0.05;
    }

    // Keep angle between 0 and 2π
    playerTank.angle = playerTank.angle % (Math.PI * 2);

    // Turret follows mouse
    const rect = canvas.getBoundingClientRect();
    const mouseX = window.event ? window.event.clientX - rect.left : canvas.width / 2;
    const mouseY = window.event ? window.event.clientY - rect.top : canvas.height / 2;

    playerTank.turretAngle = Math.atan2(
        mouseY - playerTank.y,
        mouseX - playerTank.x
    );

    // Calculate new position
    let newX = playerTank.x + moveX;
    let newY = playerTank.y + moveY;

    // Check collision with obstacles before moving
    if (!checkTankObstacleCollision(newX, newY, playerTank.width, playerTank.height)) {
        playerTank.x = newX;
        playerTank.y = newY;
    }

    // Keep player within bounds (with some padding)
    const padding = playerTank.width / 2;
    playerTank.x = Math.max(padding, Math.min(canvas.width - padding, playerTank.x));
    playerTank.y = Math.max(padding, Math.min(canvas.height - padding, playerTank.y));

    // Shooting
    if (keys[' '] && Date.now() - playerTank.lastShot > playerTank.shotDelay) {
        shoot(playerTank.x, playerTank.y, playerTank.turretAngle, false);
        playerTank.lastShot = Date.now();

        if (soundEnabled) {
            shootSound.currentTime = 0;
            shootSound.play().catch(e => console.log("Audio play failed:", e));
        }
    }
}

// Update enemies
function updateEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];

        // Simple AI: move toward player sometimes, otherwise wander
        const chance = Math.random();
        if (chance < 0.02) { // 2% chance to change target angle
            enemy.targetAngle = Math.atan2(
                playerTank.y - enemy.y,
                playerTank.x - enemy.x
            );
        } else if (chance < 0.05) { // 3% chance to wander
            enemy.targetAngle += (Math.random() - 0.5) * 0.5;
        }

        // Smoothly rotate toward target angle
        let angleDiff = enemy.targetAngle - enemy.angle;
        // Normalize angle difference to [-π, π]
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        enemy.angle += Math.sign(angleDiff) * Math.min(enemy.turnSpeed, Math.abs(angleDiff));

        // Move forward
        let newX = enemy.x + Math.cos(enemy.angle) * enemy.speed;
        let newY = enemy.y + Math.sin(enemy.angle) * enemy.speed;

        // Check collision with obstacles
        if (!checkTankObstacleCollision(newX, newY, enemy.width, enemy.height)) {
            enemy.x = newX;
            enemy.y = newY;
        } else {
            // If would collide, turn away
            enemy.targetAngle += Math.PI / 2;
        }

        // Keep within bounds
        const padding = enemy.width / 2;
        enemy.x = Math.max(padding, Math.min(canvas.width - padding, enemy.x));
        enemy.y = Math.max(padding, Math.min(canvas.height - padding, enemy.y));

        // Shooting at player
        const distanceToPlayer = distance(enemy.x, enemy.y, playerTank.x, playerTank.y);
        if (distanceToPlayer < 300 && Date.now() - enemy.lastShot > enemy.shotDelay) {
            const angleToPlayer = Math.atan2(
                playerTank.y - enemy.y,
                playerTank.x - enemy.x
            );
            shoot(enemy.x, enemy.y, angleToPlayer, true);
            enemy.lastShot = Date.now();
        }
    }
}

// Update player bullets
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];

        // Move bullet
        bullet.x += Math.cos(bullet.angle) * bullet.speed;
        bullet.y += Math.sin(bullet.angle) * bullet.speed;

        // Remove if out of bounds
        if (bullet.x < 0 || bullet.x > canvas.width ||
            bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(i, 1);
            continue;
        }

        // Remove if too old
        if (Date.now() - bullet.created > 3000) {
            bullets.splice(i, 1);
        }
    }
}

// Update enemy bullets
function updateEnemyBullets() {
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];

        // Move bullet
        bullet.x += Math.cos(bullet.angle) * bullet.speed;
        bullet.y += Math.sin(bullet.angle) * bullet.speed;

        // Remove if out of bounds
        if (bullet.x < 0 || bullet.x > canvas.width ||
            bullet.y < 0 || bullet.y > canvas.height) {
            enemyBullets.splice(i, 1);
            continue;
        }

        // Remove if too old
        if (Date.now() - bullet.created > 3000) {
            enemyBullets.splice(i, 1);
        }
    }
}

// Check collisions
function checkCollisions() {
    // Player bullets vs enemies
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];

        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];

            if (circleRectCollision(bullet.x, bullet.y, bullet.radius,
                                   enemy.x - enemy.width/2, enemy.y - enemy.height/2,
                                   enemy.width, enemy.height)) {
                // Hit enemy
                if (soundEnabled) {
                    explosionSound.currentTime = 0;
                    explosionSound.play().catch(e => console.log("Audio play failed:", e));
                }

                bullets.splice(i, 1);
                enemies.splice(j, 1);
                score += 100;
                updateUI();

                // Check level complete
                if (enemies.length === 0) {
                    setTimeout(levelComplete, 500);
                }
                break;
            }
        }
    }

    // Enemy bullets vs player
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];

        if (circleRectCollision(bullet.x, bullet.y, bullet.radius,
                               playerTank.x - playerTank.width/2, playerTank.y - playerTank.height/2,
                               playerTank.width, playerTank.height)) {
            // Hit player
            if (soundEnabled) {
                hitSound.currentTime = 0;
                hitSound.play().catch(e => console.log("Audio play failed:", e));
            }

            enemyBullets.splice(i, 1);
            lives--;
            updateUI();

            if (lives <= 0) {
                gameOver();
            }
            break;
        }
    }

    // Player vs enemies (ramming)
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        if (rectRectCollision(
            playerTank.x - playerTank.width/2, playerTank.y - playerTank.height/2,
            playerTank.width, playerTank.height,
            enemy.x - enemy.width/2, enemy.y - enemy.height/2,
            enemy.width, enemy.height
        )) {
            // Collision - damage both
            if (soundEnabled) {
                hitSound.currentTime = 0;
                hitSound.play().catch(e => console.log("Audio play failed:", e));
            }

            enemies.splice(i, 1);
            lives--;
            updateUI();

            if (lives <= 0) {
                gameOver();
            }
            break;
        }
    }
}

// Check if tank would collide with obstacle
function checkTankObstacleCollision(x, y, width, height) {
    for (const obstacle of obstacles) {
        if (rectRectCollision(
            x - width/2, y - height/2, width, height,
            obstacle.x, obstacle.y, obstacle.width, obstacle.height
        )) {
            return true;
        }
    }
    return false;
}

// Shoot a bullet
function shoot(x, y, angle, isEnemy) {
    const bullet = {
        x: x,
        y: y,
        angle: angle,
        speed: isEnemy ? 5 : 10,
        radius: 4,
        color: isEnemy ? '#e74c3c' : '#f1c40f',
        created: Date.now()
    };

    if (isEnemy) {
        enemyBullets.push(bullet);
    } else {
        bullets.push(bullet);
    }
}

// Draw obstacles
function drawObstacles() {
    for (const obstacle of obstacles) {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        // Add some texture
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(obstacle.x + 5, obstacle.y + 5, obstacle.width - 10, obstacle.height - 10);
    }
}

// Draw player tank
function drawPlayer() {
    ctx.save();
    ctx.translate(playerTank.x, playerTank.y);
    ctx.rotate(playerTank.angle);

    // Tank body
    ctx.fillStyle = playerTank.color;
    ctx.fillRect(-playerTank.width/2, -playerTank.height/2, playerTank.width, playerTank.height);

    // Tank details
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(-playerTank.width/4, -playerTank.height/4, playerTank.width/2, playerTank.height/2);

    ctx.restore();

    // Tank turret (separate rotation)
    ctx.save();
    ctx.translate(playerTank.x, playerTank.y);
    ctx.rotate(playerTank.turretAngle);

    // Turret
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, -5, 30, 10);

    // Turret tip
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(30, -3, 10, 6);

    ctx.restore();
}

// Draw enemies
function drawEnemies() {
    for (const enemy of enemies) {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.angle);

        // Enemy body
        ctx.fillStyle = enemy.color;
        ctx.fillRect(-enemy.width/2, -enemy.height/2, enemy.width, enemy.height);

        // Enemy details
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(-enemy.width/4, -enemy.height/4, enemy.width/2, enemy.height/2);

        ctx.restore();

        // Enemy turret (always faces player)
        const angleToPlayer = Math.atan2(
            playerTank.y - enemy.y,
            playerTank.x - enemy.x
        );

        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(angleToPlayer);

        // Turret
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(0, -5, 25, 10);

        // Turret tip
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(25, -3, 10, 6);

        ctx.restore();
    }
}

// Draw player bullets
function drawBullets() {
    for (const bullet of bullets) {
        ctx.fillStyle = bullet.color;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect
        ctx.fillStyle = 'rgba(241, 196, 15, 0.5)';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius + 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Draw enemy bullets
function drawEnemyBullets() {
    for (const bullet of enemyBullets) {
        ctx.fillStyle = bullet.color;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect
        ctx.fillStyle = 'rgba(231, 76, 60, 0.5)';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius + 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Utility functions
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function rectRectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 &&
           x1 + w1 > x2 &&
           y1 < y2 + h2 &&
           y1 + h1 > y2;
}

function circleRectCollision(cx, cy, radius, rx, ry, rw, rh) {
    // Find closest point on rectangle to circle
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));

    // Calculate distance from circle to this point
    const distanceX = cx - closestX;
    const distanceY = cy - closestY;

    // If distance is less than radius, collision
    return (distanceX * distanceX + distanceY * distanceY) < (radius * radius);
}

// Start the game when page loads
window.addEventListener('load', init);