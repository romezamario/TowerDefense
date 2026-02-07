import { path, towerTypes } from './constants.js';
import { Enemy, Tower, setRenderContext } from './entities.js';
import { enemies, projectiles, state, towers } from './state.js';
import { resetSelectionUI, setSelectedTower, updateUI } from './ui.js';

let ctx = null;

export const initializeGame = (renderingContext) => {
    ctx = renderingContext;
    setRenderContext(renderingContext);
};

export const selectTower = (type) => {
    state.selectedTowerType = type;
    setSelectedTower(type);
};

export const startWave = () => {
    if (state.gameRunning) return;

    state.wave += 1;
    state.gameRunning = true;
    updateUI();

    const enemyCount = 10 + (state.wave * 3);
    let spawned = 0;

    const spawnInterval = setInterval(() => {
        enemies.push(new Enemy(state.wave));
        spawned += 1;

        if (spawned >= enemyCount) {
            clearInterval(spawnInterval);
        }
    }, 1000);
};

export const handleCanvasClick = (event, canvas) => {
    if (state.selectedTowerType === null) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const cost = towerTypes[state.selectedTowerType].cost;

    if (state.money >= cost) {
        // Verificar que no esté muy cerca del camino
        let tooClose = false;
        for (const point of path) {
            if (Math.hypot(point.x - x, point.y - y) < 50) {
                tooClose = true;
                break;
            }
        }

        // Verificar que no esté sobre otra torre
        for (const tower of towers) {
            if (Math.hypot(tower.x - x, tower.y - y) < 40) {
                tooClose = true;
                break;
            }
        }

        if (!tooClose) {
            towers.push(new Tower(x, y, state.selectedTowerType));
            state.money -= cost;
            updateUI();
        }
    }
};

export const resetGame = () => {
    state.money = 500;
    state.lives = 20;
    state.wave = 0;
    state.kills = 0;
    state.selectedTowerType = null;
    state.gameRunning = false;

    towers.length = 0;
    enemies.length = 0;
    projectiles.length = 0;

    resetSelectionUI();
    updateUI();
    document.getElementById('gameOver').style.display = 'none';
};

const drawPath = () => {
    ctx.strokeStyle = 'rgba(131, 56, 236, 0.3)';
    ctx.lineWidth = 50;
    ctx.shadowColor = '#8338ec';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i += 1) {
        ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
};

const updateTowers = (currentTime) => {
    for (const tower of towers) {
        tower.update(currentTime);
        tower.draw();
    }
};

const updateProjectiles = () => {
    for (let i = projectiles.length - 1; i >= 0; i -= 1) {
        if (projectiles[i].update()) {
            projectiles.splice(i, 1);
        } else {
            projectiles[i].draw();
        }
    }
};

const updateEnemies = () => {
    for (let i = enemies.length - 1; i >= 0; i -= 1) {
        const enemy = enemies[i];

        if (enemy.health <= 0) {
            state.money += enemy.value;
            state.kills += 1;
            updateUI();
            enemies.splice(i, 1);
        } else if (enemy.move()) {
            enemies.splice(i, 1);
            state.lives -= 1;
            updateUI();
            if (state.lives <= 0) return;
        } else {
            enemy.draw();
        }
    }
};

const checkWaveEnd = () => {
    if (state.gameRunning && enemies.length === 0) {
        state.gameRunning = false;
    }
};

export const gameLoop = (currentTime) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    drawPath();
    updateTowers(currentTime);
    updateProjectiles();
    updateEnemies();
    checkWaveEnd();

    requestAnimationFrame(gameLoop);
};
