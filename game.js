const game = document.getElementById('game');
const player = document.getElementById('player');
const crosshair = document.getElementById('crosshair');
const scoreElement = document.getElementById('scoreValue');

let playerX = 400;
let playerY = 300;
let score = 0;
const keys = {};
const bullets = [];
const zombies = [];
let lastZombieSpawn = 0;

// Управление игроком
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

// Прицеливание
game.addEventListener('mousemove', (e) => {
    const rect = game.getBoundingClientRect();
    crosshair.style.left = (e.clientX - rect.left) + 'px';
    crosshair.style.top = (e.clientY - rect.top) + 'px';
});

// Стрельба
game.addEventListener('click', (e) => {
    const rect = game.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const angle = Math.atan2(mouseY - playerY, mouseX - playerX);
    createBullet(playerX, playerY, angle);
});

function createBullet(x, y, angle) {
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    game.appendChild(bullet);
    bullets.push({
        element: bullet,
        x: x,
        y: y,
        angle: angle,
        speed: 10
    });
}

function createZombie() {
    const zombie = document.createElement('div');
    zombie.className = 'zombie';
    game.appendChild(zombie);
    
    // Случайная позиция появления зомби за пределами экрана
    const side = Math.floor(Math.random() * 4);
    let x, y;
    
    switch(side) {
        case 0: // сверху
            x = Math.random() * 800;
            y = -30;
            break;
        case 1: // справа
            x = 830;
            y = Math.random() * 600;
            break;
        case 2: // снизу
            x = Math.random() * 800;
            y = 630;
            break;
        case 3: // слева
            x = -30;
            y = Math.random() * 600;
            break;
    }
    
    zombies.push({
        element: zombie,
        x: x,
        y: y,
        speed: 2
    });
}

function update() {
    // Движение игрока
    if (keys['ArrowLeft']) playerX -= 5;
    if (keys['ArrowRight']) playerX += 5;
    if (keys['ArrowUp']) playerY -= 5;
    if (keys['ArrowDown']) playerY += 5;
    
    // Ограничение движения игрока
    playerX = Math.max(20, Math.min(780, playerX));
    playerY = Math.max(20, Math.min(580, playerY));
    
    player.style.left = playerX + 'px';
    player.style.top = playerY + 'px';
    
    // Обновление пуль
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.x += Math.cos(bullet.angle) * bullet.speed;
        bullet.y += Math.sin(bullet.angle) * bullet.speed;
        bullet.element.style.left = bullet.x + 'px';
        bullet.element.style.top = bullet.y + 'px';
        
        // Удаление пуль за пределами экрана
        if (bullet.x < 0 || bullet.x > 800 || bullet.y < 0 || bullet.y > 600) {
            game.removeChild(bullet.element);
            bullets.splice(i, 1);
        }
    }
    
    // Создание зомби
    if (Date.now() - lastZombieSpawn > 1000) {
        createZombie();
        lastZombieSpawn = Date.now();
    }
    
    // Обновление зомби
    for (let i = zombies.length - 1; i >= 0; i--) {
        const zombie = zombies[i];
        const angle = Math.atan2(playerY - zombie.y, playerX - zombie.x);
        zombie.x += Math.cos(angle) * zombie.speed;
        zombie.y += Math.sin(angle) * zombie.speed;
        zombie.element.style.left = zombie.x + 'px';
        zombie.element.style.top = zombie.y + 'px';
        
        // Проверка столкновения с пулями
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bullet = bullets[j];
            const dx = zombie.x - bullet.x;
            const dy = zombie.y - bullet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 20) {
                game.removeChild(zombie.element);
                game.removeChild(bullet.element);
                zombies.splice(i, 1);
                bullets.splice(j, 1);
                score += 10;
                scoreElement.textContent = score;
                break;
            }
        }
        
        // Проверка столкновения с игроком
        const dxPlayer = zombie.x - playerX;
        const dyPlayer = zombie.y - playerY;
        const distancePlayer = Math.sqrt(dxPlayer * dxPlayer + dyPlayer * dyPlayer);
        
        if (distancePlayer < 30) {
            alert('Игра окончена! Ваш счет: ' + score);
            location.reload();
        }
    }
    
    requestAnimationFrame(update);
}

update();