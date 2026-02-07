import { upgradeLevels } from './constants.js';
import { state } from './state.js';

export const getUpgradeCost = (baseCost, level) => {
    const safeLevel = Number.isFinite(level) ? level : 0;
    const cost = baseCost * Math.log2(safeLevel + 2);
    return Math.max(1, Math.round(cost));
};

const upgradeConfigs = {
    damage: {
        baseCost: 120,
        label: 'Daño'
    },
    range: {
        baseCost: 110,
        label: 'Alcance'
    },
    fireRate: {
        baseCost: 130,
        label: 'Cadencia'
    }
};

const getUpgradePercent = (upgradeKey, level) => {
    const config = upgradeLevels[upgradeKey];
    if (!config) {
        return 0;
    }

    const multiplier = config.multiplier ** level;
    if (upgradeKey === 'fireRate') {
        return Math.round((1 - multiplier) * 100);
    }

    return Math.round((multiplier - 1) * 100);
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

export const getUpgradeSnapshot = () => {
    return Object.entries(upgradeConfigs).reduce((accumulator, [upgradeKey, config]) => {
        const level = state.towerUpgrades[upgradeKey] ?? 0;
        const percent = getUpgradePercent(upgradeKey, level);
        const prefix = upgradeKey === 'fireRate' ? '-' : '+';

        accumulator[upgradeKey] = {
            level,
            cost: getUpgradeCost(config.baseCost, level),
            label: config.label,
            valueText: `${config.label} actual: ${prefix}${percent}%`
        };

        return accumulator;
    }, {});
};
