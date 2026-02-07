export const path = [
    { x: 0, y: 200 },
    { x: 200, y: 200 },
    { x: 200, y: 400 },
    { x: 400, y: 400 },
    { x: 400, y: 100 },
    { x: 600, y: 100 },
    { x: 600, y: 300 },
    { x: 800, y: 300 }
];

export const towerProfile = {
    name: 'Centinela',
    cost: 150,
    color: '#00fff5'
};

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

    return {
        ...towerProfile,
        damage,
        range,
        fireRate,
        projectileSpeed,
        aoe
    };
};

export const levels = [
    {
        name: 'Nivel 1',
        title: 'Cadete',
        enemyCountMultiplier: 1,
        enemyHealthMultiplier: 1,
        enemySpeedMultiplier: 1,
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
        rewardMultiplier: 1.1,
        baseMoney: 400,
        baseLives: 16
    }
];
