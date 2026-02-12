export const path = [
    { x: 0, y: 240 },
    { x: 200, y: 240 },
    { x: 200, y: 480 },
    { x: 400, y: 480 },
    { x: 400, y: 120 },
    { x: 600, y: 120 },
    { x: 600, y: 360 },
    { x: 800, y: 360 }
];

export const towerProfile = {
    name: 'Centinela',
    cost: 150,
    color: '#00fff5'
};

export const towerTypes = [
    {
        ...towerProfile
    }
];

export const enemyTypes = [
    {
        name: 'Rojo',
        bodyColor: '#ff006e',
        strokeColor: '#ffbe0b',
        eyeColor: '#ffbe0b',
        shadowColor: '#ff006e',
        healthMultiplier: 1,
        speedMultiplier: 1,
        rewardMultiplier: 1
    },
    {
        name: 'Azul',
        bodyColor: '#3a86ff',
        strokeColor: '#00bbf9',
        eyeColor: '#caf0f8',
        shadowColor: '#3a86ff',
        healthMultiplier: 1,
        speedMultiplier: 1.35,
        rewardMultiplier: 1.05
    },
    {
        name: 'Verde',
        bodyColor: '#00c853',
        strokeColor: '#b2ff59',
        eyeColor: '#d9f99d',
        shadowColor: '#00c853',
        healthMultiplier: 1.6,
        speedMultiplier: 0.9,
        rewardMultiplier: 1.15
    }
];

export const upgradeLevels = {
    damage: {
        base: 20,
        multiplier: 1.2
    },
    range: {
        base: 130,
        multiplier: 1.1
    },
    fireRate: {
        base: 700,
        multiplier: 0.9
    },
    health: {
        base: 160,
        multiplier: 1.25
    },
    projectileSpeed: {
        base: 6,
        multiplier: 1.05
    },
    aoe: {
        base: 0,
        multiplier: 1.1
    }
};

const computeUpgradeValue = (config, level) => config.base * (config.multiplier ** level);

export const getTowerStats = (upgradeState = {}) => {
    const damage = Math.round(computeUpgradeValue(upgradeLevels.damage, upgradeState.damage ?? 0));
    const range = Math.round(computeUpgradeValue(upgradeLevels.range, upgradeState.range ?? 0));
    const fireRate = Math.max(
        100,
        Math.round(computeUpgradeValue(upgradeLevels.fireRate, upgradeState.fireRate ?? 0))
    );
    const projectileSpeed = Math.max(
        1,
        Math.round(computeUpgradeValue(upgradeLevels.projectileSpeed, upgradeState.projectileSpeed ?? 0))
    );
    const aoe = Math.round(computeUpgradeValue(upgradeLevels.aoe, upgradeState.aoe ?? 0));
    const health = Math.round(computeUpgradeValue(upgradeLevels.health, upgradeState.health ?? 0));

    return {
        ...towerProfile,
        damage,
        range,
        fireRate,
        health,
        projectileSpeed,
        aoe
    };
};

export const getTowerCost = (towerCount = 0) => {
    const safeCount = Number.isFinite(towerCount) ? towerCount : 0;
    const cost = towerProfile.cost * Math.log2(safeCount + 2);
    return Math.max(1, Math.round(cost));
};

export const levels = [
    {
        name: 'Nivel 1',
        title: 'Cadete',
        enemyCountMultiplier: 1,
        enemyHealthMultiplier: 1,
        enemySpeedMultiplier: 1,
        enemyDamageMultiplier: 1,
        rewardMultiplier: 1,
        baseMoney: 500,
        baseLives: 20
    },
    {
        name: 'Nivel 2',
        title: 'Veterano',
        enemyCountMultiplier: 1.2,
        enemyHealthMultiplier: 1.15,
        enemySpeedMultiplier: 1.1,
        enemyDamageMultiplier: 1.1,
        rewardMultiplier: 1.05,
        baseMoney: 450,
        baseLives: 18
    },
    {
        name: 'Nivel 3',
        title: 'Élite',
        enemyCountMultiplier: 1.4,
        enemyHealthMultiplier: 1.3,
        enemySpeedMultiplier: 1.2,
        enemyDamageMultiplier: 1.2,
        rewardMultiplier: 1.1,
        baseMoney: 400,
        baseLives: 16
    }
];

export const adsConfig = {
    enabled: true,
    rewarded: {
        baseReward: 100,
        waveRewardMultiplier: 20,
        maxRewardPerView: 350,
        cooldownMs: 45000,
        maxRewardsPerRun: 5
    }
};
