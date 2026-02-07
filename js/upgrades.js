export const getUpgradeCost = (baseCost, level) => {
    const safeLevel = Number.isFinite(level) ? level : 0;
    const cost = baseCost * Math.log2(safeLevel + 2);
    return Math.max(1, Math.round(cost));
};
