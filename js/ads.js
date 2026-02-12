import { adsConfig } from './constants.js';
import { state } from './state.js';

const adState = {
    initialized: false,
    loading: false,
    showing: false,
    ready: false,
    lastRewardAt: 0,
    rewardsGrantedThisRun: 0,
    statusMessage: 'Anuncios no inicializados.'
};

const wait = (ms) => new Promise((resolve) => {
    window.setTimeout(resolve, ms);
});

const clampReward = (value) => Math.min(adsConfig.rewarded.maxRewardPerView, value);

const computeRewardValue = () => {
    const waveReward = adsConfig.rewarded.baseReward + (state.wave * adsConfig.rewarded.waveRewardMultiplier);
    return clampReward(waveReward);
};

const canShowRewardedInternal = () => {
    if (!adsConfig.enabled) {
        return { allowed: false, reason: 'La monetización está desactivada.' };
    }
    if (!adState.initialized) {
        return { allowed: false, reason: 'Los anuncios aún no se inicializaron.' };
    }
    if (!adState.ready || adState.loading || adState.showing) {
        return { allowed: false, reason: 'No hay anuncio recompensado disponible.' };
    }
    if (state.lives <= 0) {
        return { allowed: false, reason: 'No se puede reclamar recompensa en game over.' };
    }
    if (state.gameRunning) {
        return { allowed: false, reason: 'Solo disponible entre oleadas.' };
    }
    if (adState.rewardsGrantedThisRun >= adsConfig.rewarded.maxRewardsPerRun) {
        return { allowed: false, reason: 'Límite de anuncios por partida alcanzado.' };
    }

    const elapsed = Date.now() - adState.lastRewardAt;
    if (adState.lastRewardAt > 0 && elapsed < adsConfig.rewarded.cooldownMs) {
        const remainingMs = adsConfig.rewarded.cooldownMs - elapsed;
        const remainingSeconds = Math.ceil(remainingMs / 1000);
        return {
            allowed: false,
            reason: `Espera ${remainingSeconds}s para el siguiente anuncio.`
        };
    }

    return { allowed: true, reason: '' };
};

export const initAds = async () => {
    if (!adsConfig.enabled) {
        adState.statusMessage = 'Monetización desactivada por configuración.';
        return getAdsSnapshot();
    }

    if (adState.initialized) {
        return getAdsSnapshot();
    }

    adState.loading = true;
    adState.statusMessage = 'Inicializando proveedor de anuncios...';
    await wait(700);
    adState.initialized = true;
    adState.loading = false;
    adState.ready = true;
    adState.statusMessage = 'Anuncio recompensado listo.';

    return getAdsSnapshot();
};

const markAdReadyAfterDelay = async () => {
    adState.loading = true;
    adState.ready = false;
    adState.statusMessage = 'Cargando próximo anuncio...';
    await wait(1200);
    adState.loading = false;
    adState.ready = true;
    adState.statusMessage = 'Anuncio recompensado listo.';
};

export const canShowRewardedAd = () => canShowRewardedInternal();

export const showRewardedAd = async () => {
    const eligibility = canShowRewardedInternal();
    if (!eligibility.allowed) {
        adState.statusMessage = eligibility.reason;
        return { granted: false, reason: eligibility.reason, reward: 0 };
    }

    adState.showing = true;
    adState.ready = false;
    adState.statusMessage = 'Reproduciendo anuncio recompensado...';
    await wait(1800);

    const reward = computeRewardValue();
    state.money += reward;

    adState.showing = false;
    adState.lastRewardAt = Date.now();
    adState.rewardsGrantedThisRun += 1;
    adState.statusMessage = `Recompensa otorgada: +${reward} créditos.`;

    void markAdReadyAfterDelay();

    return { granted: true, reward, reason: '' };
};

export const resetAdsForNewRun = () => {
    adState.rewardsGrantedThisRun = 0;
    adState.lastRewardAt = 0;
    adState.ready = adState.initialized;
    adState.showing = false;
    adState.loading = false;
    adState.statusMessage = adState.initialized
        ? 'Anuncio recompensado listo.'
        : 'Anuncios no inicializados.';
};

export const getAdsSnapshot = () => {
    const eligibility = canShowRewardedInternal();
    return {
        enabled: adsConfig.enabled,
        initialized: adState.initialized,
        loading: adState.loading,
        showing: adState.showing,
        ready: adState.ready,
        rewardsGrantedThisRun: adState.rewardsGrantedThisRun,
        maxRewardsPerRun: adsConfig.rewarded.maxRewardsPerRun,
        statusMessage: adState.statusMessage,
        rewardPreview: computeRewardValue(),
        canClaimReward: eligibility.allowed,
        blockedReason: eligibility.reason
    };
};
