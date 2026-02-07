import { towerTypes } from './constants.js';
import { state, towers } from './state.js';
import { getUpgradeCost } from './upgrades.js';
import { state } from './state.js';
import { getUpgradeSnapshot } from './upgrades.js';

export const setSelectedTower = (type) => {
    document.querySelectorAll('.tower-btn[data-tower-type]').forEach((btn) => {
        const btnType = Number(btn.dataset.towerType);
        btn.classList.toggle('selected', btnType === type);
    });
};

export const renderUpgradePanel = () => {
    const snapshot = getUpgradeSnapshot();

    Object.entries(snapshot).forEach(([key, data]) => {
        const levelElement = document.getElementById(`${key}Level`);
        const costElement = document.getElementById(`${key}Cost`);
        const valueElement = document.getElementById(`${key}Value`);
        const button = document.querySelector(`button[data-upgrade="${key}"]`);

        if (levelElement) {
            levelElement.textContent = data.level;
        }
        if (costElement) {
            costElement.textContent = data.cost;
        }
        if (valueElement) {
            valueElement.textContent = data.valueText;
        }
        if (button) {
            button.disabled = state.money < data.cost;
        }
    });
};

export const updateUI = () => {
    document.getElementById('money').textContent = state.money;
    document.getElementById('lives').textContent = state.lives;
    document.getElementById('wave').textContent = state.wave;
    renderUpgradePanel();

    if (state.lives <= 0) {
        document.getElementById('finalWave').textContent = state.wave;
        document.getElementById('finalKills').textContent = state.kills;
        document.getElementById('gameOver').style.display = 'block';
        state.gameRunning = false;
    }

    updateUpgradeUI();
};

export const resetSelectionUI = () => {
    document.querySelectorAll('.tower-btn[data-tower-type]').forEach((btn) => {
        btn.classList.remove('selected');
    });
};

export const showGameScreen = () => {
    const homeScreen = document.getElementById('homeScreen');
    const gameScreen = document.getElementById('gameScreen');

    if (homeScreen && gameScreen) {
        homeScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        window.scrollTo(0, 0);
        return;
    }

    console.warn('showGameScreen: missing #homeScreen or #gameScreen elements.');
    if (homeScreen) {
        homeScreen.classList.add('hidden');
    }
    if (gameScreen) {
        gameScreen.classList.remove('hidden');
    }
};

export const showSpecialAttackBanner = (attackType, destroyedCount) => {
    const gameScreen = document.getElementById('gameScreen');
    if (!gameScreen) {
        return;
    }

    let banner = document.getElementById('specialAttackBanner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'specialAttackBanner';
        banner.style.position = 'absolute';
        banner.style.top = '110px';
        banner.style.left = '50%';
        banner.style.transform = 'translateX(-50%)';
        banner.style.padding = '12px 20px';
        banner.style.borderRadius = '12px';
        banner.style.background = 'rgba(5, 8, 20, 0.92)';
        banner.style.border = '2px solid #ffbe0b';
        banner.style.boxShadow = '0 0 24px rgba(255, 190, 11, 0.6)';
        banner.style.fontFamily = "'Orbitron', sans-serif";
        banner.style.fontSize = '0.9rem';
        banner.style.letterSpacing = '1px';
        banner.style.textTransform = 'uppercase';
        banner.style.color = '#ffbe0b';
        banner.style.zIndex = '15';
        banner.style.transition = 'opacity 0.3s ease';
        gameScreen.appendChild(banner);
    }

    banner.textContent = `${attackType} en camino: ${destroyedCount} torres destruidas`;
    banner.style.opacity = '1';

    if (banner.dataset.timeoutId) {
        clearTimeout(Number(banner.dataset.timeoutId));
    }

    const timeoutId = window.setTimeout(() => {
        banner.style.opacity = '0';
    }, 3000);
    banner.dataset.timeoutId = String(timeoutId);
};

const updateUpgradeUI = () => {
    const towerLabel = document.getElementById('selectedTowerLabel');
    const levelValue = document.getElementById('towerLevel');
    const upgradeCostValue = document.getElementById('upgradeCost');
    const upgradeButton = document.getElementById('upgradeBtn');

    if (!towerLabel || !levelValue || !upgradeCostValue || !upgradeButton) {
        return;
    }

    const selectedTower = towers.find((tower) => tower.id === state.selectedTowerId);
    if (!selectedTower) {
        towerLabel.textContent = 'Selecciona una torre para mejorar.';
        levelValue.textContent = '-';
        upgradeCostValue.textContent = '-';
        upgradeButton.disabled = true;
        return;
    }

    const towerType = towerTypes[selectedTower.type];
    const cost = getUpgradeCost(towerType.cost, selectedTower.level);

    towerLabel.textContent = `Torre seleccionada: ${towerType.name}`;
    levelValue.textContent = `${selectedTower.level + 1}`;
    upgradeCostValue.textContent = `${cost}`;
    upgradeButton.disabled = state.money < cost;
};
