import { gameLoop, handleCanvasClick, initializeGame, resetGame, selectTower, startWave } from './game.js';
import { updateUI } from './ui.js';

const createStars = () => {
    const starsContainer = document.getElementById('stars');
    for (let i = 0; i < 100; i += 1) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        starsContainer.appendChild(star);
    }
};

const setupUIEvents = (canvas) => {
    document.querySelectorAll('.tower-btn[data-tower-type]').forEach((button) => {
        button.addEventListener('click', () => {
            const type = Number(button.dataset.towerType);
            selectTower(type);
        });
    });

    document.getElementById('startBtn').addEventListener('click', startWave);
    document.getElementById('restartBtn').addEventListener('click', resetGame);
    canvas.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        handleCanvasClick(event, canvas);
    });
};

const initialize = () => {
    createStars();

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    initializeGame(ctx);

    setupUIEvents(canvas);
    updateUI();

    requestAnimationFrame(gameLoop);
};

initialize();
