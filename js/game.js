const gameContainer = document.getElementById('game-container');
const spaceship = document.getElementById('spaceship');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const gameOverDisplay = document.getElementById('game-over');
const restartButton = document.getElementById('restart-button');
const leaderboard = document.getElementById('leaderboard');
const leaderboardList = document.getElementById('leaderboard-list');

// Sound effects
const shootSound = new Audio('./sounds/shoot.mp3');
const explosionSound = new Audio('./sounds/explosion.mp3');
const gameOverSound = new Audio('./sounds/game-over.mp3');

let score = 0;
let lives = 3;
let gameInterval;
let asteroidInterval;
let enemyInterval;
let leaderboardData = JSON.parse(localStorage.getItem('leaderboard')) || [];
let isAudioEnabled = false;

// Enable audio on first user interaction
document.addEventListener('click', () => {
    if (!isAudioEnabled) {
        const silentSound = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
        silentSound.play().then(() => {
            isAudioEnabled = true;
        });
    }
});

// Play shoot sound
function playShootSound() {
    if (isAudioEnabled) {
        shootSound.currentTime = 0;
        shootSound.play();
    }
}

// Play explosion sound
function playExplosionSound() {
    if (isAudioEnabled) {
        explosionSound.currentTime = 0;
        explosionSound.play();
    }
}

// Play game over sound
function playGameOverSound() {
    if (isAudioEnabled) {
        gameOverSound.currentTime = 0;
        gameOverSound.play();
    }
}

// Initialize game
function initGame() {
    score = 0;
    lives = 3;
    scoreDisplay.textContent = `Score: ${score}`;
    livesDisplay.textContent = `Lives: ${lives}`;
    gameOverDisplay.style.display = 'none';
    leaderboard.style.display = 'block';
    updateLeaderboard();
    startGame();
}

// Restart game
restartButton.addEventListener('click', () => {
    gameContainer.querySelectorAll('.asteroid, .enemy, .bullet').forEach(element => element.remove());
    initGame();
});

// Move spaceship
document.addEventListener('mousemove', (e) => {
    const x = e.clientX - spaceship.offsetWidth / 2;
    spaceship.style.left = `${x}px`;
});

// Shoot bullet
document.addEventListener('click', () => {
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    bullet.style.left = `${spaceship.offsetLeft + spaceship.offsetWidth / 2 - 2.5}px`;
    bullet.style.bottom = `${spaceship.offsetHeight}px`;
    gameContainer.appendChild(bullet);
    playShootSound();

    const bulletInterval = setInterval(() => {
        const bulletBottom = parseInt(bullet.style.bottom);
        if (bulletBottom > window.innerHeight) {
            clearInterval(bulletInterval);
            bullet.remove();
        } else {
            bullet.style.bottom = `${bulletBottom + 10}px`;
        }

        document.querySelectorAll('.asteroid, .enemy').forEach(enemy => {
            if (checkCollision(bullet, enemy)) {
                enemy.remove();
                bullet.remove();
                score += 10;
                scoreDisplay.textContent = `Score: ${score}`;
                playExplosionSound();
            }
        });
    }, 20);
});

// Create asteroid
function createAsteroid() {
    const asteroid = document.createElement('div');
    asteroid.classList.add('asteroid');
    asteroid.style.left = `${Math.random() * (window.innerWidth - 40)}px`;
    asteroid.style.top = `-40px`;
    gameContainer.appendChild(asteroid);

    const asteroidInterval = setInterval(() => {
        const asteroidTop = parseInt(asteroid.style.top);
        if (asteroidTop > window.innerHeight) {
            clearInterval(asteroidInterval);
            asteroid.remove();
        } else {
            asteroid.style.top = `${asteroidTop + 5}px`;
        }

        if (checkCollision(spaceship, asteroid)) {
            clearInterval(asteroidInterval);
            asteroid.remove();
            lives--;
            livesDisplay.textContent = `Lives: ${lives}`;
            if (lives === 0) {
                gameOver();
            }
        }
    }, 20);
}

// Create enemy
function createEnemy() {
    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    enemy.style.left = `${Math.random() * (window.innerWidth - 40)}px`;
    enemy.style.top = `-40px`;
    gameContainer.appendChild(enemy);

    const enemyInterval = setInterval(() => {
        const enemyTop = parseInt(enemy.style.top);
        if (enemyTop > window.innerHeight) {
            clearInterval(enemyInterval);
            enemy.remove();
        } else {
            enemy.style.top = `${enemyTop + 3}px`;
        }

        if (checkCollision(spaceship, enemy)) {
            clearInterval(enemyInterval);
            enemy.remove();
            lives--;
            livesDisplay.textContent = `Lives: ${lives}`;
            if (lives === 0) {
                gameOver();
            }
        }
    }, 20);
}

// Check collision
function checkCollision(a, b) {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();

    return !(
        aRect.top > bRect.bottom ||
        aRect.bottom < bRect.top ||
        aRect.left > bRect.right ||
        aRect.right < bRect.left
    );
}

// Game over
function gameOver() {
    clearInterval(gameInterval);
    clearInterval(asteroidInterval);
    clearInterval(enemyInterval);
    gameOverDisplay.style.display = 'block';
    playGameOverSound();
    updateLeaderboard(score);
}

// Update leaderboard
function updateLeaderboard(newScore = null) {
    if (newScore !== null) {
        leaderboardData.push(newScore);
        leaderboardData.sort((a, b) => b - a).slice(0, 5);
        localStorage.setItem('leaderboard', JSON.stringify(leaderboardData));
    }
    leaderboardList.innerHTML = leaderboardData.map((score, index) => `<li>${score}</li>`).join('');
}

// Start game
function startGame() {
    gameInterval = setInterval(() => {
        createAsteroid();
        createEnemy();
    }, 1000);
}

// Initialize game on load
initGame();