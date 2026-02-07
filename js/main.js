import {
    gameLoop,
    handleCanvasClick,
    initializeGame,
    resetGame,
    selectTower,
    setLevel,
    startWave,
    upgradeSelectedTower
} from './game.js';
import { levels } from './constants.js';
import { showGameScreen, updateUI } from './ui.js';

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

const updateVersionBadge = () => {
    const versionValue = document.getElementById('versionValue');
    if (!versionValue) return;
    const lastModified = new Date(document.lastModified);
    const formatter = new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
    versionValue.textContent = `Versión: ${formatter.format(lastModified)}`;
};

const setupUIEvents = (canvas) => {
    document.querySelectorAll('.tower-btn[data-tower-type]').forEach((button) => {
        button.addEventListener('click', () => {
            const type = Number(button.dataset.towerType);
            selectTower(type);
        });
    });

    const levelValue = document.getElementById('levelValue');
    const levelPrev = document.getElementById('levelPrev');
    const levelNext = document.getElementById('levelNext');
    let currentLevelIndex = 0;

    const updateLevelDisplay = () => {
        const level = levels[currentLevelIndex];
        levelValue.textContent = `${level.name} · ${level.title}`;
        setLevel(currentLevelIndex);
    };

    const changeLevel = (direction) => {
        currentLevelIndex = (currentLevelIndex + direction + levels.length) % levels.length;
        updateLevelDisplay();
    };

    levelPrev.addEventListener('click', () => changeLevel(-1));
    levelNext.addEventListener('click', () => changeLevel(1));
    const homeScreen = document.getElementById('homeScreen');
    document.addEventListener('keydown', (event) => {
        if (!homeScreen || homeScreen.classList.contains('hidden')) return;
        if (event.key === 'ArrowLeft') {
            changeLevel(-1);
        } else if (event.key === 'ArrowRight') {
            changeLevel(1);
        }
    });

    document.getElementById('restartBtn').addEventListener('click', resetGame);
    const upgradeBtn = document.getElementById('upgradeBtn');
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', upgradeSelectedTower);
    }
    document.getElementById('startWaveBtn').addEventListener(
        'click',
        () => {
            showGameScreen();
            startWave();
        },
        { once: true },
    );
    canvas.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        handleCanvasClick(event, canvas);
    });

    updateLevelDisplay();
};

const initialize = () => {
    createStars();
    updateVersionBadge();

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    initializeGame(ctx);

    setupUIEvents(canvas);
    updateUI();

    requestAnimationFrame(gameLoop);
};

initialize();
