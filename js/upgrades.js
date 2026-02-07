export const getUpgradeCost = (baseCost, level) => {
    const safeLevel = Number.isFinite(level) ? level : 0;
    const cost = baseCost * Math.log2(safeLevel + 2);
    return Math.max(1, Math.round(cost));
import { towerTypes } from './constants.js';
import { state } from './state.js';

const baseTowerTypes = towerTypes.map((tower) => ({ ...tower }));
const COST_MULTIPLIER = 1.35;

const upgradeConfigs = {
    damage: {
        levelKey: 'damageLevel',
        costKey: 'damageCost',
        step: 0.12,
        label: 'Daño'
    },
    range: {
        levelKey: 'rangeLevel',
        costKey: 'rangeCost',
        step: 0.08,
        label: 'Alcance'
    },
    fireRate: {
        levelKey: 'fireRateLevel',
        costKey: 'fireRateCost',
        step: 0.06,
        label: 'Cadencia'
    }
};

const getDamageMultiplier = (level) => 1 + upgradeConfigs.damage.step * level;
const getRangeMultiplier = (level) => 1 + upgradeConfigs.range.step * level;
const getFireRateMultiplier = (level) => Math.max(0.5, 1 - upgradeConfigs.fireRate.step * level);

const refreshTowerStats = () => {
    const damageMultiplier = getDamageMultiplier(state.towerUpgrades.damageLevel);
    const rangeMultiplier = getRangeMultiplier(state.towerUpgrades.rangeLevel);
    const fireRateMultiplier = getFireRateMultiplier(state.towerUpgrades.fireRateLevel);

    towerTypes.forEach((tower, index) => {
        const base = baseTowerTypes[index];
        tower.damage = Math.round(base.damage * damageMultiplier);
        tower.range = Math.round(base.range * rangeMultiplier);
        tower.fireRate = Math.max(120, Math.round(base.fireRate * fireRateMultiplier));
    });
};

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
    refreshTowerStats();
    return true;
};

export const getUpgradeSnapshot = () => {
    const damageLevel = state.towerUpgrades.damageLevel;
    const rangeLevel = state.towerUpgrades.rangeLevel;
    const fireRateLevel = state.towerUpgrades.fireRateLevel;
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
