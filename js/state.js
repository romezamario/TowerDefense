export const state = {
    money: 500,
    lives: 20,
    wave: 0,
    kills: 0,
    levelIndex: 0,
    selectedTowerType: 0,
    selectedTowerId: null,
    towerUpgrades: {
        damage: 0,
        range: 0,
        fireRate: 0,
        health: 0,
        projectileSpeed: 0,
        aoe: 0
    },
    gameRunning: false,
    nextWaveScheduled: false
};

export const towers = [];
export const enemies = [];
export const projectiles = [];
export const enemyProjectiles = [];
