import { path, towerTypes } from './constants.js';
import { enemies, projectiles } from './state.js';

let ctx = null;

export const setRenderContext = (renderingContext) => {
    ctx = renderingContext;
};

export class Tower {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.lastFire = 0;
        this.target = null;
        this.angle = 0;
    }

    draw() {
        const type = towerTypes[this.type];

        // Dibujar rango (solo si está seleccionada)
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = type.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, type.range, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

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
    }

    findTarget() {
        let closest = null;
        let minDist = Infinity;
        const type = towerTypes[this.type];

        for (const enemy of enemies) {
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

    update(currentTime) {
        this.findTarget();
        const type = towerTypes[this.type];

        if (this.target && currentTime - this.lastFire > type.fireRate) {
            projectiles.push(new Projectile(
                this.x,
                this.y,
                this.target,
                this.type
            ));
            this.lastFire = currentTime;
        }
    }
}

export class Enemy {
    constructor(waveNum) {
        this.pathIndex = 0;
        this.x = path[0].x;
        this.y = path[0].y;
        this.health = 50 + (waveNum * 15);
        this.maxHealth = this.health;
        this.speed = 1 + (waveNum * 0.1);
        this.value = 25 + (waveNum * 5);
        this.size = 15;
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
}

export class Projectile {
    constructor(x, y, target, towerType) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.type = towerType;
        this.speed = towerTypes[towerType].projectileSpeed;
    }

    draw() {
        const type = towerTypes[this.type];
        ctx.fillStyle = type.color;
        ctx.shadowColor = type.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        if (!this.target || this.target.health <= 0) return true;

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 10) {
            // Impacto
            const type = towerTypes[this.type];

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
