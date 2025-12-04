class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.vx = 0;
        this.vy = 0;
        this.baseSpeed = 0.2;
        this.speed = this.baseSpeed;
        this.friction = 0.98;
        this.size = 15;
        this.shootCooldown = 0;
        this.baseShootRate = 10;
        this.shootRate = this.baseShootRate;
        this.powerupEffects = {
            rapidFire: { duration: 0, stacks: 0 },
            speedBoost: { duration: 0, stacks: 0 },
            multiShot: { duration: 0, stacks: 0 },
            miniShips: { duration: 0, stacks: 0 },
            magnet: { duration: 0, stacks: 0 }
        };
    }

    update(keys, keyMappings, width, height) {
        // Update powerup effects
        Object.keys(this.powerupEffects).forEach(effect => {
            if (this.powerupEffects[effect].duration > 0) {
                this.powerupEffects[effect].duration--;
                // Reset stacks if duration expires
                if (this.powerupEffects[effect].duration <= 0) {
                    this.powerupEffects[effect].stacks = 0;
                }
            }
        });

        // Apply effects
        this.speed = this.baseSpeed * (this.powerupEffects.speedBoost.duration > 0 ? 2 : 1);
        this.shootRate = this.baseShootRate * (this.powerupEffects.rapidFire.duration > 0 ? 0.5 : 1);

        // Handle input
        if (keys[keyMappings.up]) {
            this.vy -= this.speed;
        }
        if (keys[keyMappings.down]) {
            this.vy += this.speed;
        }
        if (keys[keyMappings.left]) {
            this.vx -= this.speed;
        }
        if (keys[keyMappings.right]) {
            this.vx += this.speed;
        }

        // Apply friction
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Screen wrapping
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Update angle based on velocity
        if (this.vx !== 0 || this.vy !== 0) {
            this.angle = Math.atan2(this.vy, this.vx);
        }

        // Shooting
        if (this.shootCooldown > 0) this.shootCooldown--;
    }

    canShoot() {
        return this.shootCooldown <= 0;
    }

    shoot() {
        this.shootCooldown = this.shootRate;
        const hasPowerup = this.powerupEffects.rapidFire.duration > 0 ||
                          this.powerupEffects.speedBoost.duration > 0 ||
                          this.powerupEffects.multiShot.duration > 0 ||
                          this.powerupEffects.miniShips.duration > 0;

        // Calculate rapid fire range multiplier (1 + 0.5 * stacks, max 3)
        const rapidFireStacks = this.powerupEffects.rapidFire.stacks;
        const rangeMultiplier = Math.min(1 + 0.5 * rapidFireStacks, 3);

        // Calculate multi-shot projectile count
        const multiShotStacks = this.powerupEffects.multiShot.stacks;
        const projectileCount = multiShotStacks > 0 ? Math.min(1 + multiShotStacks + 1, 5) : 1;

        const projectiles = [];
        const spreadAngle = 0.3; // base spread for multi-shot

        for (let i = 0; i < projectileCount; i++) {
            let angle = this.angle;
            if (projectileCount > 1) {
                // Spread projectiles evenly
                const spread = (spreadAngle * 2) / (projectileCount - 1);
                angle = this.angle - spreadAngle + (spread * i);
            }
            projectiles.push(new Projectile(this.x, this.y, angle, hasPowerup, rangeMultiplier));
        }

        return projectiles;
    }

    render(ctx) {
        // Draw magnet radius if active
        if (this.powerupEffects.magnet.duration > 0) {
            const magnetStacks = this.powerupEffects.magnet.stacks;
            const magnetRadius = 100 + (magnetStacks - 1) * 50;

            ctx.save();
            // Fill circle with light orange
            ctx.fillStyle = '#f80';
            ctx.globalAlpha = 0.1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, magnetRadius, 0, Math.PI * 2);
            ctx.fill();

            // Outline circle
            ctx.strokeStyle = '#f80';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.5;
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.restore();
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Draw triangle
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.size, 0);
        ctx.lineTo(-this.size / 2, -this.size / 2);
        ctx.lineTo(-this.size / 2, this.size / 2);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    }
}

class MiniShip {
    constructor(player, tier = 1) {
        this.player = player;
        this.tier = tier;
        this.angle = 0;
        this.radius = tier === 2 ? 60 : 50; // larger ships orbit farther
        this.size = tier === 2 ? 12 : 8; // larger ships are bigger
        this.shootCooldown = 0;
        this.shootRate = tier === 2 ? 20 : 15; // tier 2 shoots slower
    }

    update(enemies, projectiles) {
        // Orbit around player
        this.angle += 0.05; // rotation speed
        this.x = this.player.x + Math.cos(this.angle) * this.radius;
        this.y = this.player.y + Math.sin(this.angle) * this.radius;

        // Auto-shoot at nearest enemy
        if (this.shootCooldown > 0) this.shootCooldown--;
        if (this.shootCooldown <= 0 && enemies.length > 0) {
            // Find nearest enemy
            let nearestEnemy = null;
            let minDist = Infinity;
            enemies.forEach(enemy => {
                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDist) {
                    minDist = dist;
                    nearestEnemy = enemy;
                }
            });

            if (nearestEnemy) {
                const dx = nearestEnemy.x - this.x;
                const dy = nearestEnemy.y - this.y;
                const baseAngle = Math.atan2(dy, dx);

                if (this.tier === 2) {
                    // Tier 2: multi-shot (3 projectiles)
                    const spread = 0.3; // radians
                    projectiles.push(new Projectile(this.x, this.y, baseAngle - spread, false, 1, 'miniShip'));
                    projectiles.push(new Projectile(this.x, this.y, baseAngle, false, 1, 'miniShip'));
                    projectiles.push(new Projectile(this.x, this.y, baseAngle + spread, false, 1, 'miniShip'));
                } else {
                    // Tier 1: single shot
                    projectiles.push(new Projectile(this.x, this.y, baseAngle, false, 1, 'miniShip'));
                }
                this.shootCooldown = this.shootRate;
            }
        }
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Draw small triangle
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.size, 0);
        ctx.lineTo(-this.size / 2, -this.size / 2);
        ctx.lineTo(-this.size / 2, this.size / 2);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    }
}
