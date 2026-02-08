import { getTowerStats, levels, path, towerProfile } from './constants.js';
import { Enemy, Tower, rebuildEnemySpatialIndex, setRenderContext } from './entities.js';
import { enemies, projectiles, state, towers } from './state.js';
import { resetSelectionUI, setSelectedTower, showSpecialAttackBanner, updateUI } from './ui.js';
import { getUpgradeCost } from './upgrades.js';

let ctx = null;
let nextWaveTimeoutId = null;
let spawnIntervalId = null;
let pathCanvas = null;
let pathCanvasContext = null;
let cachedPathWidth = 0;
let cachedPathHeight = 0;
let uiDirty = false;

const stopSpawns = () => {
    if (nextWaveTimeoutId) {
        clearTimeout(nextWaveTimeoutId);
        nextWaveTimeoutId = null;
    }
    if (spawnIntervalId) {
        clearInterval(spawnIntervalId);
        spawnIntervalId = null;
    }
    state.nextWaveScheduled = false;
};

export const initializeGame = (renderingContext) => {
    ctx = renderingContext;
    setRenderContext(renderingContext);
};

export const selectTower = (type) => {
    if (towers.length > 0) {
        state.selectedTowerId = towers[0].id;
        state.selectedTowerType = null;
        setSelectedTower(null);
        return;
    }

    state.selectedTowerType = type;
    setSelectedTower(type);
};

const applyLevelSettings = () => {
    const level = levels[state.levelIndex] ?? levels[0];
    state.money = level.baseMoney;
    state.lives = level.baseLives;
};

export const setLevel = (levelIndex) => {
    state.levelIndex = levelIndex;
    applyLevelSettings();
    updateUI();
};

export const startWave = () => {
    if (state.gameRunning) return;
    if (state.lives <= 0) return;
    stopSpawns();

    state.wave += 1;
    if (state.wave % 10 === 0) {
        triggerSpecialAttack();
    }
    state.gameRunning = true;
    updateUI();

    const level = levels[state.levelIndex] ?? levels[0];
    const enemyCount = Math.round((10 + (state.wave * 3)) * level.enemyCountMultiplier);
    let spawned = 0;

    spawnIntervalId = setInterval(() => {
        enemies.push(new Enemy(state.wave, level));
        spawned += 1;

        if (spawned >= enemyCount) {
            clearInterval(spawnIntervalId);
            spawnIntervalId = null;
        }
    }, 1000);
};

const specialAttackConfig = {
    types: ['Meteoritos', 'Agujero negro', 'Supernova'],
    minDestroyed: 1,
    maxDestroyed: 4,
    percentDestroyed: 0.3
};

const triggerSpecialAttack = () => {
    if (towers.length === 0) {
        return;
    }

    const attackType = specialAttackConfig.types[Math.floor(Math.random() * specialAttackConfig.types.length)];
    const percentBased = Math.floor(towers.length * specialAttackConfig.percentDestroyed);
    const randomTarget = Math.floor(
        Math.random() * (specialAttackConfig.maxDestroyed - specialAttackConfig.minDestroyed + 1)
    ) + specialAttackConfig.minDestroyed;
    const destroyCount = Math.min(
        towers.length,
        specialAttackConfig.maxDestroyed,
        Math.max(specialAttackConfig.minDestroyed, percentBased, randomTarget)
    );

    const indices = towers.map((_, index) => index);
    for (let i = indices.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const toRemove = indices.slice(0, destroyCount).sort((a, b) => b - a);

    let removedSelected = false;
    for (const index of toRemove) {
        if (towers[index]?.id === state.selectedTowerId) {
            removedSelected = true;
        }
        towers.splice(index, 1);
    }

    if (removedSelected) {
        state.selectedTowerId = null;
    }

    showSpecialAttackBanner(attackType, destroyCount);
};

export const handleCanvasClick = (event, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    if (towers.length > 0) {
        let closestTower = null;
        let minDist = Infinity;

        for (const tower of towers) {
            const dist = Math.hypot(tower.x - x, tower.y - y);
            if (dist < 20 && dist < minDist) {
                closestTower = tower;
                minDist = dist;
            }
        }

        state.selectedTowerId = closestTower ? closestTower.id : towers[0].id;
        state.selectedTowerType = null;
        setSelectedTower(null);
        return;
    }

    if (state.selectedTowerType === null) {
        let closestTower = null;
        let minDist = Infinity;

        for (const tower of towers) {
            const dist = Math.hypot(tower.x - x, tower.y - y);
            if (dist < 20 && dist < minDist) {
                closestTower = tower;
                minDist = dist;
            }
        }

        state.selectedTowerId = closestTower ? closestTower.id : null;
        updateUI();
        return;
    }

    const cost = towerProfile.cost;

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
            const newTower = new Tower(x, y);
            towers.push(newTower);
            state.selectedTowerId = newTower.id;
            state.money -= cost;
            updateUI();
        }
    }
};

export const upgradeSelectedTower = () => {
    if (state.selectedTowerId === null) {
        return;
    }

    const tower = towers.find((item) => item.id === state.selectedTowerId);
    if (!tower) {
        return;
    }

    const baseCost = towerTypes[tower.type].cost;
    const cost = getUpgradeCost(baseCost, tower.level);

    if (state.money < cost) {
        return;
    }

    state.money -= cost;
    tower.level += 1;
    updateUI();
};

export const resetGame = () => {
    applyLevelSettings();
    state.wave = 0;
    state.kills = 0;
    state.selectedTowerType = 0;
    state.selectedTowerId = null;
    state.gameRunning = false;
    stopSpawns();

    towers.length = 0;
    enemies.length = 0;
    projectiles.length = 0;

    resetSelectionUI();
    updateUI();
    const gameOver = document.getElementById('gameOver');
    if (gameOver) {
        gameOver.style.display = 'none';
    }
    startWave();
};

const drawPath = () => {
    if (!pathCanvas) {
        pathCanvas = document.createElement('canvas');
        pathCanvasContext = pathCanvas.getContext('2d');
    }
    if (!pathCanvasContext) {
        return;
    }

    if (cachedPathWidth !== ctx.canvas.width || cachedPathHeight !== ctx.canvas.height) {
        cachedPathWidth = ctx.canvas.width;
        cachedPathHeight = ctx.canvas.height;
        pathCanvas.width = cachedPathWidth;
        pathCanvas.height = cachedPathHeight;

        pathCanvasContext.clearRect(0, 0, pathCanvas.width, pathCanvas.height);
        pathCanvasContext.strokeStyle = 'rgba(131, 56, 236, 0.3)';
        pathCanvasContext.lineWidth = 50;
        pathCanvasContext.shadowColor = '#8338ec';
        pathCanvasContext.shadowBlur = 20;
        pathCanvasContext.beginPath();
        pathCanvasContext.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i += 1) {
            pathCanvasContext.lineTo(path[i].x, path[i].y);
        }
        pathCanvasContext.stroke();
        pathCanvasContext.shadowBlur = 0;
    }
};

const updateTowers = (currentTime, towerStats) => {
    for (const tower of towers) {
        tower.update(currentTime, towerStats);
        tower.draw(tower.id === state.selectedTowerId, towerStats);
    }
};

const updateProjectiles = (towerStats) => {
    for (let i = projectiles.length - 1; i >= 0; i -= 1) {
        if (projectiles[i].update(towerStats)) {
            projectiles.splice(i, 1);
        } else {
            projectiles[i].draw(towerStats);
        }
    }
};

const updateEnemies = () => {
    for (let i = enemies.length - 1; i >= 0; i -= 1) {
        const enemy = enemies[i];

        if (enemy.health <= 0) {
            state.money += enemy.value;
            state.kills += 1;
            uiDirty = true;
            enemies.splice(i, 1);
        } else if (enemy.move()) {
            enemies.splice(i, 1);
            state.lives -= 1;
            uiDirty = true;
            if (state.lives <= 0) {
                state.gameRunning = false;
                stopSpawns();
                return;
            }
        } else {
            enemy.draw();
        }
    }
};

const checkWaveEnd = () => {
    if (state.gameRunning && enemies.length === 0 && !spawnIntervalId) {
        state.gameRunning = false;
        if (state.lives > 0 && !state.nextWaveScheduled) {
            state.nextWaveScheduled = true;
            nextWaveTimeoutId = setTimeout(() => {
                nextWaveTimeoutId = null;
                startWave();
            }, 3000);
        }
    }
};

export const gameLoop = (currentTime) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.shadowBlur = 0;

    drawPath();
    if (pathCanvas) {
        ctx.drawImage(pathCanvas, 0, 0);
    }
    const towerStats = getTowerStats(state.towerUpgrades);
    rebuildEnemySpatialIndex();
    updateTowers(currentTime, towerStats);
    updateProjectiles(towerStats);
    updateEnemies();
    checkWaveEnd();
    if (uiDirty) {
        updateUI();
        uiDirty = false;
    }

    requestAnimationFrame(gameLoop);
};
