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
        this.powerupTiers = {
            rapidFire: 1,
            speedBoost: 1,
            multiShot: 1,
            miniShips: 1,
            magnet: 1
        };
        this.beamData = [];
        this.pushbackTimer = 0;
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

        // Update tiers
        this.powerupTiers.rapidFire = this.powerupEffects.rapidFire.stacks >= 10 ? 3 : this.powerupEffects.rapidFire.stacks >= 5 ? 2 : 1;
        this.powerupTiers.speedBoost = this.powerupEffects.speedBoost.stacks >= 10 ? 3 : this.powerupEffects.speedBoost.stacks >= 5 ? 2 : 1;
        this.powerupTiers.multiShot = this.powerupEffects.multiShot.stacks >= 10 ? 3 : this.powerupEffects.multiShot.stacks >= 5 ? 2 : 1;
        this.powerupTiers.miniShips = this.powerupEffects.miniShips.stacks >= 10 ? 3 : this.powerupEffects.miniShips.stacks >= 5 ? 2 : 1;
        this.powerupTiers.magnet = this.powerupEffects.magnet.stacks >= 10 ? 3 : this.powerupEffects.magnet.stacks >= 5 ? 2 : 1;

        // Update pushback timer
        if (this.pushbackTimer > 0) this.pushbackTimer--;

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

        // Warp ability
        if (keys[keyMappings.warp] && this.powerupTiers.speedBoost === 2) {
            this.x += this.vx * 25; // Skip ahead (adjusted for visibility)
            this.y += this.vy * 25;
            // Screen wrapping
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
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

        // Check for beam weapon (tier 2+ rapid fire)
        if (this.powerupTiers.rapidFire >= 2) {
            // Calculate beam count based on multiShot stacks
            const multiShotStacks = this.powerupEffects.multiShot.stacks;
            const beamCount = multiShotStacks > 0 ? Math.min(1 + multiShotStacks + 1, 5) : 1;

            // Tier 3: thicker beams and double range
            const beamLength = this.powerupTiers.rapidFire === 3 ? 400 : 200;

            this.beamData = [];
            const spreadAngle = 0.3; // base spread for multi-beams

            for (let i = 0; i < beamCount; i++) {
                let angle = this.angle;
                if (beamCount > 1) {
                    // Spread beams evenly
                    const spread = (spreadAngle * 2) / (beamCount - 1);
                    angle = this.angle - spreadAngle + (spread * i);
                }
                this.beamData.push({ angle: angle, length: beamLength });
            }
            return [];
        }

        // Calculate rapid fire range multiplier (1 + 0.5 * stacks, max 3)
        const rapidFireStacks = this.powerupEffects.rapidFire.stacks;
        const rangeMultiplier = Math.min(1 + 0.5 * rapidFireStacks, 3);

        // Calculate multi-shot projectile count
        const multiShotStacks = this.powerupEffects.multiShot.stacks;
        const projectileCount = multiShotStacks > 0 ? Math.min(1 + multiShotStacks + 1, 5) : 1;

        // Size multiplier for tier 2 multishot
        const sizeMultiplier = this.powerupTiers.multiShot === 2 ? 2 : 1;

        const projectiles = [];
        const spreadAngle = 0.3; // base spread for multi-shot

        for (let i = 0; i < projectileCount; i++) {
            let angle = this.angle;
            if (projectileCount > 1) {
                // Spread projectiles evenly
                const spread = (spreadAngle * 2) / (projectileCount - 1);
                angle = this.angle - spreadAngle + (spread * i);
            }
            // Add bounce count for tier 3 multiShot
            const bounceCount = this.powerupTiers.multiShot === 3 ? 1 : 0;
            projectiles.push(new Projectile(this.x, this.y, angle, hasPowerup, rangeMultiplier, 'player', sizeMultiplier, bounceCount));
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

        if (this.powerupTiers.speedBoost === 3) {
            // Tier 3: pulsing glowing diamond
            const pulse = (Math.sin(Date.now() / 200) + 1) / 2; // 0 to 1 pulsing
            const glowSize = this.size * (1 + pulse * 0.5);

            // Outer glow
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 10 + pulse * 5;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(glowSize, 0);
            ctx.lineTo(0, -glowSize);
            ctx.lineTo(-glowSize, 0);
            ctx.lineTo(0, glowSize);
            ctx.closePath();
            ctx.stroke();

            // Inner diamond
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            const hue = (Date.now() / 10) % 360; // Rainbow cycling
            ctx.strokeStyle = `hsl(${hue}, 100%, 70%)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.size, 0);
            ctx.lineTo(0, -this.size);
            ctx.lineTo(-this.size, 0);
            ctx.lineTo(0, this.size);
            ctx.closePath();
            ctx.stroke();
        } else {
            // Normal triangle
            ctx.strokeStyle = '#0f0';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.size, 0);
            ctx.lineTo(-this.size / 2, -this.size / 2);
            ctx.lineTo(-this.size / 2, this.size / 2);
            ctx.closePath();
            ctx.stroke();
        }

        ctx.restore();

        // Draw beams if active
        if (this.beamData && this.beamData.length > 0) {
            ctx.save();
            ctx.translate(this.x, this.y);
            const isTier3 = this.powerupTiers.rapidFire === 3;

            this.beamData.forEach(beam => {
                ctx.save();
                ctx.rotate(beam.angle);

                // Layered stroke glow effect (no shadows)
                // Outer glow layer
                ctx.globalAlpha = 0.4;
                ctx.strokeStyle = '#ff0';
                ctx.lineWidth = isTier3 ? 12 : 8;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(beam.length, 0);
                ctx.stroke();

                // Inner bright beam
                ctx.globalAlpha = 0.8;
                ctx.lineWidth = isTier3 ? 6 : 4;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(beam.length, 0);
                ctx.stroke();

                // Core white line
                ctx.globalAlpha = 1;
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = isTier3 ? 2 : 1;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(beam.length, 0);
                ctx.stroke();

                ctx.restore();
            });
            ctx.restore();
            this.beamData = []; // Reset after drawing
        }
    }
}

class MiniShip {
    constructor(player) {
        this.player = player;
        this.tier = 1;
        this.angle = 0;
        this.radius = 50;
        this.size = 8;
        this.shootCooldown = 0;
        this.shootRate = 15;
        this.beamData = null;
    }

    update(enemies, projectiles) {
        // Update tier dynamically
        this.tier = this.player.powerupTiers.miniShips;
        this.radius = this.tier === 2 ? 60 : 50;
        this.size = this.tier === 2 ? 12 : 8;
        this.shootRate = this.tier === 2 ? 20 : 15;
        // Tier 3: enhanced beam properties
        this.beamLength = this.tier === 3 ? 200 : 100;
        this.beamWidth = this.tier === 3 ? 4 : 2;

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

                if (this.tier >= 2) {
                    // Tier 2+: beam weapon
                    this.beamData = { angle: baseAngle, length: this.beamLength };
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

        if (this.tier === 2) {
            // Tier 2: rainbow circle
            const hue = (Date.now() / 2) % 360; // Cycle hue over time
            ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Tier 1: small triangle
            ctx.strokeStyle = '#0ff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.size, 0);
            ctx.lineTo(-this.size / 2, -this.size / 2);
            ctx.lineTo(-this.size / 2, this.size / 2);
            ctx.closePath();
            ctx.stroke();
        }

        // Draw beam if active
        if (this.beamData) {
            ctx.rotate(this.beamData.angle);

            // Layered stroke glow effect (no shadows)
            // Outer glow layer
            ctx.globalAlpha = 0.5;
            ctx.strokeStyle = '#0ff';
            ctx.lineWidth = this.beamWidth + 4;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(this.beamData.length, 0);
            ctx.stroke();

            // Inner bright beam
            ctx.globalAlpha = 0.8;
            ctx.lineWidth = this.beamWidth + 1;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(this.beamData.length, 0);
            ctx.stroke();

            // Core white line
            ctx.globalAlpha = 1;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = Math.max(1, this.beamWidth * 0.3);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(this.beamData.length, 0);
            ctx.stroke();

            this.beamData = null; // Reset after drawing
        }

        ctx.restore();
    }
}
