import { enemyTypes, getTowerCost, getTowerStats, levels, path } from './constants.js';
import { Enemy, Tower, rebuildEnemySpatialIndex, setRenderContext } from './entities.js';
import { enemies, enemyProjectiles, projectiles, state, towers } from './state.js';
import { resetSelectionUI, setSelectedTower, showSpecialAttackBanner, updateUI } from './ui.js';
import { resetAdsForNewRun } from './ads.js';

let ctx = null;
let nextWaveTimeoutId = null;
let spawnIntervalId = null;
let pathCanvas = null;
let pathCanvasContext = null;
let cachedPathWidth = 0;
let cachedPathHeight = 0;
let uiDirty = false;

const getTowerStatsCached = () => {
    if (!state.towerStatsCache || state.towerStatsDirty) {
        state.towerStatsCache = getTowerStats(state.towerUpgrades);
        state.towerStatsDirty = false;
    }
    return state.towerStatsCache;
};

const findClosestTower = (x, y, maxDistance) => {
    let closestTower = null;
    let minDistSq = Infinity;
    const maxDistSq = maxDistance ** 2;

    for (const tower of towers) {
        const dx = tower.x - x;
        const dy = tower.y - y;
        const distSq = (dx * dx) + (dy * dy);
        if (distSq < maxDistSq && distSq < minDistSq) {
            closestTower = tower;
            minDistSq = distSq;
        }
    }

    return closestTower;
};

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

const scheduleNextWave = () => {
    if (state.isPaused || state.lives <= 0 || state.gameRunning || enemies.length > 0 || spawnIntervalId || state.nextWaveScheduled) {
        return;
    }

    state.nextWaveScheduled = true;
    nextWaveTimeoutId = setTimeout(() => {
        nextWaveTimeoutId = null;
        state.nextWaveScheduled = false;
        if (!state.isPaused) {
            startWave();
        }
    }, 2000);
};

export const initializeGame = (renderingContext) => {
    ctx = renderingContext;
    setRenderContext(renderingContext);
};

export const selectTower = (type) => {
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

export const setGamePaused = (paused) => {
    const nextPausedState = Boolean(paused);
    if (state.isPaused === nextPausedState) {
        return;
    }

    state.isPaused = nextPausedState;
    if (state.isPaused) {
        if (nextWaveTimeoutId) {
            clearTimeout(nextWaveTimeoutId);
            nextWaveTimeoutId = null;
        }
        state.nextWaveScheduled = false;
    } else {
        scheduleNextWave();
    }
    updateUI();
};

export const startWave = () => {
    if (state.gameRunning) return;
    if (state.isPaused) return;
    if (state.lives <= 0) return;
    stopSpawns();

    state.wave = Number(state.wave) + 1;
    const isBossWave = state.wave % 10 === 0;
    if (isBossWave) {
        triggerSpecialAttack();
    }
    state.gameRunning = true;
    updateUI();

    const level = levels[state.levelIndex] ?? levels[0];
    const enemyCount = Math.round((10 + (state.wave * 3)) * level.enemyCountMultiplier);
    let spawned = 0;

    const shooterChance = state.wave >= 2
        ? Math.min(0.45, 0.1 + (state.wave - 2) * 0.05)
        : 0;

    const pickEnemyType = () => {
        const roll = Math.random();
        if (roll < 0.5) {
            return enemyTypes[0];
        }
        if (roll < 0.75) {
            return enemyTypes[1];
        }
        return enemyTypes[2];
    };

    if (isBossWave) {
        const bossLevel = Math.floor(state.wave / 10);
        enemies.push(new Enemy(state.wave, level, { isBoss: true, bossLevel, canShoot: true }));
    }

    spawnIntervalId = setInterval(() => {
        const canShoot = Math.random() < shooterChance;
        enemies.push(new Enemy(state.wave, level, { canShoot, type: pickEnemyType() }));
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
    uiDirty = true;
};

export const handleCanvasClick = (event, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const clickedTower = findClosestTower(x, y, 20);

    if (clickedTower) {
        state.selectedTowerId = clickedTower.id;
        updateUI();
        return;
    }

    if (state.selectedTowerType === null) {
        const closestTower = findClosestTower(x, y, 20);
        state.selectedTowerId = closestTower ? closestTower.id : null;
        updateUI();
        return;
    }

    const cost = getTowerCost(towers.length);

    if (state.money >= cost) {
        // Verificar que no esté muy cerca del camino
        let tooClose = false;
        const pathMinDistSq = 50 ** 2;
        for (const point of path) {
            const dx = point.x - x;
            const dy = point.y - y;
            if ((dx * dx) + (dy * dy) < pathMinDistSq) {
                tooClose = true;
                break;
            }
        }

        // Verificar que no esté sobre otra torre
        const towerMinDistSq = 40 ** 2;
        for (const tower of towers) {
            const dx = tower.x - x;
            const dy = tower.y - y;
            if ((dx * dx) + (dy * dy) < towerMinDistSq) {
                tooClose = true;
                break;
            }
        }

        if (!tooClose) {
            const newTower = new Tower(x, y, state.selectedTowerType ?? 0);
            towers.push(newTower);
            state.selectedTowerId = newTower.id;
            state.money -= cost;
            updateUI();
        }
    }
};

export const resetGame = () => {
    applyLevelSettings();
    state.wave = 0;
    state.kills = 0;
    state.selectedTowerType = 0;
    state.selectedTowerId = null;
    state.gameRunning = false;
    state.isPaused = false;
    state.towerStatsDirty = true;
    stopSpawns();
    resetAdsForNewRun();

    towers.length = 0;
    enemies.length = 0;
    projectiles.length = 0;
    enemyProjectiles.length = 0;

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
    for (let i = towers.length - 1; i >= 0; i -= 1) {
        const tower = towers[i];
        tower.update(currentTime, towerStats);
        if (tower.health <= 0) {
            if (tower.id === state.selectedTowerId) {
                state.selectedTowerId = null;
            }
            towers.splice(i, 1);
            uiDirty = true;
            continue;
        }
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

const updateEnemies = (currentTime) => {
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
            enemy.updateAttack(currentTime, towers, enemyProjectiles);
            enemy.draw();
        }
    }
};

const updateEnemyProjectiles = () => {
    for (let i = enemyProjectiles.length - 1; i >= 0; i -= 1) {
        if (enemyProjectiles[i].update()) {
            enemyProjectiles.splice(i, 1);
        } else {
            enemyProjectiles[i].draw();
        }
    }
};

const checkWaveEnd = () => {
    if (state.gameRunning && enemies.length === 0 && !spawnIntervalId) {
        state.gameRunning = false;
        scheduleNextWave();
    }
};

export const gameLoop = (currentTime) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.shadowBlur = 0;

    drawPath();
    if (pathCanvas) {
        ctx.drawImage(pathCanvas, 0, 0);
    }
    const towerStats = getTowerStatsCached();

    if (!state.isPaused) {
        rebuildEnemySpatialIndex();
        updateTowers(currentTime, towerStats);
        updateProjectiles(towerStats);
        updateEnemies(currentTime);
        updateEnemyProjectiles();
        checkWaveEnd();
    }
    if (uiDirty) {
        updateUI();
        uiDirty = false;
    }

    requestAnimationFrame(gameLoop);
};
