import { getTowerStats, upgradeLevels } from './constants.js';
import { state } from './state.js';

export const getUpgradeCost = (baseCost, level) => {
    const safeLevel = Number.isFinite(level) ? level : 0;
    const cost = baseCost * Math.log2(safeLevel + 2);
    return Math.max(1, Math.round(cost));
};
const COST_MULTIPLIER = 1.35;

const upgradeConfigs = {
    damage: {
        levelKey: 'damage',
        costKey: 'damageCost',
        baseCost: 120,
        multiplier: upgradeLevels.damage.multiplier,
        label: 'Daño'
    },
    range: {
        levelKey: 'range',
        costKey: 'rangeCost',
        baseCost: 110,
        multiplier: upgradeLevels.range.multiplier,
        label: 'Alcance'
    },
    fireRate: {
        levelKey: 'fireRate',
        costKey: 'fireRateCost',
        baseCost: 130,
        multiplier: upgradeLevels.fireRate.multiplier,
        label: 'Cadencia'
    },
    health: {
        levelKey: 'health',
        costKey: 'healthCost',
        baseCost: 140,
        multiplier: upgradeLevels.health.multiplier,
        label: 'Vida'
    }
};

const getDamageMultiplier = (level) => upgradeConfigs.damage.multiplier ** level;
const getRangeMultiplier = (level) => upgradeConfigs.range.multiplier ** level;
const getFireRateMultiplier = (level) => upgradeConfigs.fireRate.multiplier ** level;
const getHealthMultiplier = (level) => upgradeConfigs.health.multiplier ** level;

export const applyUpgrade = (upgradeKey) => {
    const config = upgradeConfigs[upgradeKey];
    if (!config) {
        return false;
    }

    const currentLevel = state.towerUpgrades[upgradeKey] ?? 0;
    const cost = getUpgradeCost(config.baseCost, currentLevel);
    if (state.money < cost) {
        return false;
    }

    state.money -= cost;
    state.towerUpgrades[config.levelKey] += 1;
    state.towerUpgrades[config.costKey] = Math.round(cost * COST_MULTIPLIER);
    return true;
};

const getPercentChange = (currentValue, baseValue, isInverse = false) => {
    if (!baseValue) {
        return 0;
    }

    if (isInverse) {
        return Math.max(0, Math.round((1 - currentValue / baseValue) * 100));
    }

    return Math.max(0, Math.round((currentValue / baseValue - 1) * 100));
};

export const getUpgradeSnapshot = () => {
    const baseStats = getTowerStats();
    const currentStats = getTowerStats(state.towerUpgrades);
    const damageLevel = state.towerUpgrades.damage;
    const rangeLevel = state.towerUpgrades.range;
    const fireRateLevel = state.towerUpgrades.fireRate;
    const healthLevel = state.towerUpgrades.health;
    const damageMultiplier = getDamageMultiplier(damageLevel);
    const rangeMultiplier = getRangeMultiplier(rangeLevel);
    const fireRateMultiplier = getFireRateMultiplier(fireRateLevel);
    const healthMultiplier = getHealthMultiplier(healthLevel);

    return {
        damage: {
            level: state.towerUpgrades.damage,
            cost: getUpgradeCost(upgradeConfigs.damage.baseCost, state.towerUpgrades.damage),
            label: upgradeConfigs.damage.label,
            valueText: `${upgradeConfigs.damage.label} actual: +${getPercentChange(currentStats.damage, baseStats.damage)}%`
        },
        range: {
            level: state.towerUpgrades.range,
            cost: getUpgradeCost(upgradeConfigs.range.baseCost, state.towerUpgrades.range),
            label: upgradeConfigs.range.label,
            valueText: `${upgradeConfigs.range.label} actual: +${getPercentChange(currentStats.range, baseStats.range)}%`
        },
        fireRate: {
            level: state.towerUpgrades.fireRate,
            cost: getUpgradeCost(upgradeConfigs.fireRate.baseCost, state.towerUpgrades.fireRate),
            label: upgradeConfigs.fireRate.label,
            valueText: `${upgradeConfigs.fireRate.label} actual: -${getPercentChange(currentStats.fireRate, baseStats.fireRate, true)}%`
        },
        health: {
            level: state.towerUpgrades.health,
            cost: getUpgradeCost(upgradeConfigs.health.baseCost, state.towerUpgrades.health),
            label: upgradeConfigs.health.label,
            valueText: `${upgradeConfigs.health.label} actual: +${getPercentChange(currentStats.health, baseStats.health)}%`
        }
    };
};
