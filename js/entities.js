import { path } from './constants.js';
import { enemies, projectiles } from './state.js';

let ctx = null;
const enemySpatialGrid = {
    cellSize: 120,
    buckets: new Map()
};

const getCellKey = (cellX, cellY) => `${cellX},${cellY}`;

export const rebuildEnemySpatialIndex = () => {
    const { cellSize, buckets } = enemySpatialGrid;
    buckets.clear();

    for (const enemy of enemies) {
        const cellX = Math.floor(enemy.x / cellSize);
        const cellY = Math.floor(enemy.y / cellSize);
        const key = getCellKey(cellX, cellY);
        if (!buckets.has(key)) {
            buckets.set(key, []);
        }
        buckets.get(key).push(enemy);
    }
};

const getEnemiesInRange = (x, y, range) => {
    const { cellSize, buckets } = enemySpatialGrid;
    const minCellX = Math.floor((x - range) / cellSize);
    const maxCellX = Math.floor((x + range) / cellSize);
    const minCellY = Math.floor((y - range) / cellSize);
    const maxCellY = Math.floor((y + range) / cellSize);
    const nearby = [];

    for (let cellX = minCellX; cellX <= maxCellX; cellX += 1) {
        for (let cellY = minCellY; cellY <= maxCellY; cellY += 1) {
            const bucket = buckets.get(getCellKey(cellX, cellY));
            if (bucket) {
                nearby.push(...bucket);
            }
        }
    }

    return nearby;
};

export const setRenderContext = (renderingContext) => {
    ctx = renderingContext;
};

export class Tower {
    constructor(x, y, type = 0) {
        this.id = Tower.nextId;
        Tower.nextId += 1;
        this.x = x;
        this.y = y;
        this.lastFire = 0;
        this.target = null;
        this.angle = 0;
        this.health = 0;
        this.maxHealth = 0;
    }

    draw(showRange = false, towerStats) {
        const type = towerStats;
        const healthPercent = this.maxHealth > 0 ? this.health / this.maxHealth : 0;

        // Dibujar rango (solo si está seleccionada)
        if (showRange) {
            ctx.globalAlpha = 0.1;
            ctx.fillStyle = type.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, type.range, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // Base de la torre
        ctx.save();
        ctx.translate(this.x, this.y);

        // Círculo base
        ctx.fillStyle = '#0a0e27';
        ctx.strokeStyle = type.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Rotar según el objetivo
        ctx.rotate(this.angle);

        // Cañón
        ctx.fillStyle = type.color;
        ctx.shadowColor = type.color;
        ctx.shadowBlur = 15;
        ctx.fillRect(-5, -25, 10, 30);

        ctx.restore();

        // Barra de vida de la torre
        ctx.fillStyle = '#1a1f3c';
        ctx.fillRect(this.x - 18, this.y + 24, 36, 5);
        ctx.fillStyle = healthPercent > 0.5 ? '#00fff5' : healthPercent > 0.25 ? '#ffbe0b' : '#ff006e';
        ctx.fillRect(this.x - 18, this.y + 24, 36 * healthPercent, 5);
    }

    findTarget(towerStats) {
        let closest = null;
        let minDist = Infinity;
        const type = towerStats;

        const nearbyEnemies = getEnemiesInRange(this.x, this.y, type.range);

        for (const enemy of nearbyEnemies) {
            const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (dist < type.range && dist < minDist) {
                closest = enemy;
                minDist = dist;
            }
        }

        this.target = closest;

        if (this.target) {
            this.angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
        }
    }

    update(currentTime, towerStats) {
        if (towerStats.health !== this.maxHealth) {
            const previousMax = this.maxHealth || towerStats.health;
            this.maxHealth = towerStats.health;
            const delta = this.maxHealth - previousMax;
            this.health = Math.min(this.maxHealth, this.health + Math.max(0, delta));
            if (this.health === 0) {
                this.health = this.maxHealth;
            }
        }
        this.findTarget(towerStats);
        const type = towerStats;

        if (this.target && currentTime - this.lastFire > type.fireRate) {
            projectiles.push(new Projectile(
                this.x,
                this.y,
                this.target,
                type
            ));
            this.lastFire = currentTime;
        }
    }
}

Tower.nextId = 1;

export class Enemy {
    constructor(waveNum, levelConfig = {}, options = {}) {
        this.pathIndex = 0;
        this.x = path[0].x;
        this.y = path[0].y;
        const healthMultiplier = levelConfig.enemyHealthMultiplier ?? 1;
        const speedMultiplier = levelConfig.enemySpeedMultiplier ?? 1;
        const rewardMultiplier = levelConfig.rewardMultiplier ?? 1;
        const damageMultiplier = levelConfig.enemyDamageMultiplier ?? 1;
        this.health = Math.round((50 + (waveNum * 15)) * healthMultiplier);
        this.maxHealth = this.health;
        this.speed = (1 + (waveNum * 0.1)) * speedMultiplier * 1.1;
        this.value = Math.round((25 + (waveNum * 5)) * rewardMultiplier);
        this.size = 15;
        this.canShoot = options.canShoot ?? false;
        this.fireRate = 1400;
        this.range = 180;
        this.lastShot = 0;
        this.damage = Math.max(1, Math.round((4 + (waveNum * 1.4)) * damageMultiplier));
    }

    draw() {
        // Barra de vida
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - 20, this.y - 25, 40, 5);
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(this.x - 20, this.y - 25, 40 * healthPercent, 5);

        // Cuerpo del enemigo
        ctx.save();
        ctx.translate(this.x, this.y);

        // Forma alienígena
        ctx.fillStyle = '#ff006e';
        ctx.strokeStyle = '#ffbe0b';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ff006e';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size, this.size);
        ctx.lineTo(-this.size, this.size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Ojos
        ctx.fillStyle = '#ffbe0b';
        ctx.beginPath();
        ctx.arc(-5, -3, 3, 0, Math.PI * 2);
        ctx.arc(5, -3, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    move() {
        if (this.pathIndex >= path.length - 1) {
            return true;
        }

        const target = path[this.pathIndex + 1];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < this.speed) {
            this.pathIndex++;
        } else {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }

        return false;
    }

    findTowerTarget(towers) {
        let closest = null;
        let minDist = Infinity;

        for (const tower of towers) {
            const dist = Math.hypot(tower.x - this.x, tower.y - this.y);
            if (dist < this.range && dist < minDist) {
                closest = tower;
                minDist = dist;
            }
        }

        return closest;
    }

    updateAttack(currentTime, towers, enemyProjectiles) {
        if (!this.canShoot) return;
        if (currentTime - this.lastShot < this.fireRate) return;
        const target = this.findTowerTarget(towers);
        if (!target) return;

        enemyProjectiles.push(new EnemyProjectile(this.x, this.y, target, this.damage));
        this.lastShot = currentTime;
    }
}

export class Projectile {
    constructor(x, y, target, towerStats) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.speed = towerStats.projectileSpeed;
    }

    draw(towerStats) {
        const type = towerStats;
        ctx.fillStyle = type.color;
        ctx.shadowColor = type.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    update(towerStats) {
        if (!this.target || this.target.health <= 0) return true;

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 10) {
            // Impacto
            const type = towerStats;

            if (type.aoe) {
                // Daño en área
                for (const enemy of enemies) {
                    const distToEnemy = Math.hypot(enemy.x - this.x, enemy.y - this.y);
                    if (distToEnemy < type.aoe) {
                        enemy.health -= type.damage;
                    }
                }
            } else {
                this.target.health -= type.damage;
            }

            return true;
        }

        this.x += (dx / dist) * this.speed;
        this.y += (dy / dist) * this.speed;

        return false;
    }
}

export class EnemyProjectile {
    constructor(x, y, target, damage) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.speed = 4.5;
    }

    draw() {
        ctx.fillStyle = '#ff006e';
        ctx.shadowColor = '#ff006e';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        if (!this.target || this.target.health <= 0) return true;

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 8) {
            this.target.health = Math.max(0, this.target.health - this.damage);
            return true;
        }

        this.x += (dx / dist) * this.speed;
        this.y += (dy / dist) * this.speed;

        return false;
    }
}
