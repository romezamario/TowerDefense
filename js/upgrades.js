import { upgradeLevels } from './constants.js';
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
        multiplier: upgradeLevels.damage.multiplier,
        label: 'Daño'
    },
    range: {
        levelKey: 'range',
        costKey: 'rangeCost',
        multiplier: upgradeLevels.range.multiplier,
        label: 'Alcance'
    },
    fireRate: {
        levelKey: 'fireRate',
        costKey: 'fireRateCost',
        multiplier: upgradeLevels.fireRate.multiplier,
        label: 'Cadencia'
    }
};

const getDamageMultiplier = (level) => upgradeConfigs.damage.multiplier ** level;
const getRangeMultiplier = (level) => upgradeConfigs.range.multiplier ** level;
const getFireRateMultiplier = (level) => upgradeConfigs.fireRate.multiplier ** level;

export const applyUpgrade = (upgradeKey) => {
    const config = upgradeConfigs[upgradeKey];
    if (!config) {
        return false;
    }

    const cost = state.towerUpgrades[config.costKey];
    if (state.money < cost) {
        return false;
    }

    state.money -= cost;
    state.towerUpgrades[config.levelKey] += 1;
    state.towerUpgrades[config.costKey] = Math.round(cost * COST_MULTIPLIER);
    return true;
};

export const getUpgradeSnapshot = () => {
    const damageLevel = state.towerUpgrades.damage;
    const rangeLevel = state.towerUpgrades.range;
    const fireRateLevel = state.towerUpgrades.fireRate;
    const damageMultiplier = getDamageMultiplier(damageLevel);
    const rangeMultiplier = getRangeMultiplier(rangeLevel);
    const fireRateMultiplier = getFireRateMultiplier(fireRateLevel);

    return {
        damage: {
            level: damageLevel,
            cost: state.towerUpgrades.damageCost,
            label: upgradeConfigs.damage.label,
            valueText: `${upgradeConfigs.damage.label} actual: +${Math.round((damageMultiplier - 1) * 100)}%`
        },
        range: {
            level: rangeLevel,
            cost: state.towerUpgrades.rangeCost,
            label: upgradeConfigs.range.label,
            valueText: `${upgradeConfigs.range.label} actual: +${Math.round((rangeMultiplier - 1) * 100)}%`
        },
        fireRate: {
            level: fireRateLevel,
            cost: state.towerUpgrades.fireRateCost,
            label: upgradeConfigs.fireRate.label,
            valueText: `${upgradeConfigs.fireRate.label} actual: -${Math.round((1 - fireRateMultiplier) * 100)}%`
        }
    };
};
