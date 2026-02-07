import { getTowerStats } from './constants.js';
import { state } from './state.js';

const upgradeConfigs = {
    damage: {
        label: 'Daño',
        baseCost: 120
    },
    range: {
        label: 'Alcance',
        baseCost: 110
    },
    fireRate: {
        label: 'Cadencia',
        baseCost: 130
    }
};

const getUpgradeCost = (baseCost, level) => {
    const safeLevel = Number.isFinite(level) ? level : 0;
    const cost = baseCost * Math.log2(safeLevel + 2);
    return Math.max(1, Math.round(cost));
};

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
    state.towerUpgrades[upgradeKey] = currentLevel + 1;
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
        }
    };
};
