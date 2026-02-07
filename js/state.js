export const state = {
    money: 500,
    lives: 20,
    wave: 0,
    kills: 0,
    levelIndex: 0,
    selectedTowerType: 0,
    selectedTowerId: null,
    gameRunning: false,
    nextWaveScheduled: false,
    towerUpgrades: {
        damageLevel: 0,
        rangeLevel: 0,
        fireRateLevel: 0,
        damageCost: 120,
        rangeCost: 110,
        fireRateCost: 130
    }
};

export const towers = [];
export const enemies = [];
export const projectiles = [];
