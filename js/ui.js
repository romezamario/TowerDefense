import { state } from './state.js';

export const setSelectedTower = (type) => {
    document.querySelectorAll('.tower-btn').forEach((btn) => {
        const btnType = Number(btn.dataset.towerType);
        btn.classList.toggle('selected', btnType === type);
    });
};

export const updateUI = () => {
    document.getElementById('money').textContent = state.money;
    document.getElementById('lives').textContent = state.lives;
    document.getElementById('wave').textContent = state.wave;

    if (state.lives <= 0) {
        document.getElementById('finalWave').textContent = state.wave;
        document.getElementById('finalKills').textContent = state.kills;
        document.getElementById('gameOver').style.display = 'block';
        state.gameRunning = false;
    }
};

export const resetSelectionUI = () => {
    document.querySelectorAll('.tower-btn').forEach((btn) => {
        btn.classList.remove('selected');
    });
};

export const showGameScreen = () => {
    const homeScreen = document.getElementById('homeScreen');
    const gameScreen = document.getElementById('gameScreen');

    if (homeScreen) {
        homeScreen.classList.add('hidden');
    }
    if (gameScreen) {
        gameScreen.classList.remove('hidden');
    }
};
