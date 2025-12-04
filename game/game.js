class Game {
    constructor(canvas, ctx, settings, onGameOver) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        this.onGameOver = onGameOver;

        this.player = null;
        this.enemySpawner = null;
        this.enemies = []; // Will be managed by enemySpawner
        this.projectiles = [];
        this.particles = [];
        this.powerups = [];
        this.miniShips = [];
        this.powerupTexts = []; // Text notifications for collected powerups

        this.score = 0;
        this.lives = settings.startingLives;
        this.maxEnemies = settings.maxEnemies;
        this.totalKills = 0;
        this.gameOver = false;
        this.gameOverTimer = 0;

        this.keys = {};
        this.keyMappings = {
            up: 'KeyW',
            down: 'KeyS',
            left: 'KeyA',
            right: 'KeyD',
            shoot: 'Space',
            warp: 'ShiftLeft',
            remap: 'KeyR'
        };

        this.isRemapping = false;
        this.remapKey = null;
        this.animationId = null; // For stopping the game loop

        // Load saved key mappings
        try {
            const savedMappings = localStorage.getItem('keyMappings');
            if (savedMappings) {
                this.keyMappings = { ...this.keyMappings, ...JSON.parse(savedMappings) };
            }
        } catch (e) {
            console.warn('Corrupted key mappings data, using defaults');
        }

        this.init();
        this.setupEventListeners();
        this.canvas.focus(); // Ensure canvas receives keyboard events
        this.gameLoop();
    }

    init() {
        // Initialize game objects
        this.player = new Player(this.width / 2, this.height / 2);
        this.enemySpawner = new EnemySpawner(this.width, this.height);
        this.enemySpawner.setPlayer(this.player);
        this.enemySpawner.setMaxEnemies(this.maxEnemies);
        this.enemySpawner.startGame();
    }

    setupEventListeners() {
        // Store handler references for cleanup
        this.keydownHandler = (e) => {
            // Handle game over key press
            if (this.gameOver && !this.isRemapping) {
                this.stop();
                this.cleanup();
                this.onGameOver(this.score);
                return;
            }

            // Debug powerup keys (only during gameplay)
            if (!this.gameOver && !this.isRemapping) {
                const powerupTypes = ['rapidFire', 'speedBoost', 'multiShot', 'miniShips', 'magnet'];
                const keyIndex = parseInt(e.key) - 1;
                if (keyIndex >= 0 && keyIndex < powerupTypes.length && this.player) {
                    const powerupType = powerupTypes[keyIndex];
                    const duration = 300; // 5 seconds

                    // Apply debug powerup effect
                    switch (powerupType) {
                        case 'rapidFire':
                            this.player.powerupEffects.rapidFire.duration = duration;
                            this.player.powerupEffects.rapidFire.stacks++;
                            console.log(`Debug: Added Rapid Fire (stacks: ${this.player.powerupEffects.rapidFire.stacks})`);
                            break;
                        case 'speedBoost':
                            this.player.powerupEffects.speedBoost.duration = duration;
                            this.player.powerupEffects.speedBoost.stacks++;
                            console.log(`Debug: Added Speed Boost (stacks: ${this.player.powerupEffects.speedBoost.stacks})`);
                            break;
                        case 'multiShot':
                            this.player.powerupEffects.multiShot.duration = duration;
                            this.player.powerupEffects.multiShot.stacks++;
                            console.log(`Debug: Added Multi-Shot (stacks: ${this.player.powerupEffects.multiShot.stacks})`);
                            break;
                        case 'miniShips':
                            this.player.powerupEffects.miniShips.duration = duration;
                            this.player.powerupEffects.miniShips.stacks++;
                            // Spawn 2 mini ships per pickup
                            this.miniShips.push(new MiniShip(this.player));
                            this.miniShips.push(new MiniShip(this.player));
                            // Offset their angles
                            if (this.miniShips.length >= 2) {
                                this.miniShips[this.miniShips.length - 1].angle = Math.PI;
                                this.miniShips[this.miniShips.length - 2].angle = 0;
                            }
                            console.log(`Debug: Added Mini-Ships (stacks: ${this.player.powerupEffects.miniShips.stacks})`);
                            break;
                        case 'magnet':
                            this.player.powerupEffects.magnet.duration = duration;
                            this.player.powerupEffects.magnet.stacks++;
                            console.log(`Debug: Added Magnet (stacks: ${this.player.powerupEffects.magnet.stacks})`);
                            break;
                    }
                    return; // Don't process as normal key
                }
            }

            this.keys[e.code] = true;

            if (this.isRemapping && this.remapKey) {
                this.keyMappings[this.remapKey] = e.code;
                try {
                    localStorage.setItem('keyMappings', JSON.stringify(this.keyMappings));
                } catch (e) {
                    console.warn('Could not save key mappings');
                }
                this.isRemapping = false;
                this.remapKey = null;
                console.log('Key remapped:', this.keyMappings);
            }

            if (e.code === this.keyMappings.remap) {
                this.startRemapping();
            }
        };

        this.keyupHandler = (e) => {
            this.keys[e.code] = false;
        };

        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }

    startRemapping() {
        this.isRemapping = true;
        // For simplicity, remap shoot key
        this.remapKey = 'shoot';
        console.log('Press a key to remap shoot action...');
    }

    update() {
        if (this.gameOver) {
            return; // Don't update game logic during game over - wait for key press
        }

        // Update game logic
        if (this.player) {
            this.player.update(this.keys, this.keyMappings, this.width, this.height);

            // Shooting
            if (this.keys[this.keyMappings.shoot] && this.player.canShoot()) {
                const newProjectiles = this.player.shoot();
                this.projectiles.push(...newProjectiles);
            }
        }

        // Update enemy spawner (handles spawning and updating enemies)
        this.enemySpawner.update();
        this.enemies = this.enemySpawner.getEnemies(); // Get current enemy list

        // Magnet pushback
        if (this.player.powerupEffects.magnet.duration > 0 && this.player.powerupTiers.magnet >= 2 && this.player.pushbackTimer <= 0) {
            this.player.pushbackTimer = 300; // 5 seconds
            const magnetRadius = 100 + (this.player.powerupEffects.magnet.stacks - 1) * 50;
            // Tier 3: stronger repulsion
            const pushDist = this.player.powerupTiers.magnet === 3 ? 60 : 30;
            this.enemies.forEach(enemy => {
                const dx = enemy.x - this.player.x;
                const dy = enemy.y - this.player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < magnetRadius) {
                    const dirX = dx / dist;
                    const dirY = dy / dist;
                    enemy.x += dirX * pushDist;
                    enemy.y += dirY * pushDist;
                }
            });
        }

        // Update projectiles
        this.projectiles.forEach(projectile => {
            projectile.update(this.width, this.height);
        });
        this.projectiles = this.projectiles.filter(p => !p.isDead());

        // Update particles
        this.particles.forEach(particle => {
            particle.update();
        });
        this.particles = this.particles.filter(p => !p.isDead());

        // Update powerups
        this.powerups.forEach(powerup => {
            powerup.update();

            // Apply magnet effect if active
            if (this.player.powerupEffects.magnet.duration > 0) {
                const magnetStacks = this.player.powerupEffects.magnet.stacks;
                const magnetRadius = 100 + (magnetStacks - 1) * 50; // 100 base, +50 per additional stack

                const dx = this.player.x - powerup.x;
                const dy = this.player.y - powerup.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < magnetRadius && dist > 30) { // Don't pull too close
                    // Set constant velocity toward player
                    const speed = 3; // constant magnet speed
                    const dirX = dx / dist;
                    const dirY = dy / dist;

                    powerup.vx = dirX * speed;
                    powerup.vy = dirY * speed;
                }
            }
        });
        this.powerups = this.powerups.filter(p => !p.isDead());

        // Update mini ships
        this.miniShips.forEach(miniShip => {
            miniShip.update(this.enemies, this.projectiles);
        });

        // Update powerup texts
        this.powerupTexts = this.powerupTexts.filter(text => {
            text.lifetime--;
            text.y -= 0.5; // Float upward
            return text.lifetime > 0;
        });

        // Collision detection
        this.checkCollisions();
    }

    checkCollisions() {
        const projectilesToRemove = [];
        const enemiesToRemove = [];

        // Player vs enemies
        this.enemies.forEach(enemy => {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < this.player.size + enemy.size) {
                if (this.player.powerupTiers.speedBoost === 3) {
                    // Tier 3: destroy enemy on contact, no damage to player
                    enemy.takeDamage();
                    if (enemy.currentHealth <= 0) {
                        // Enemy destroyed
                        this.score += enemy.points;
                        this.totalKills++;
                        // Mark enemy for removal
                        enemiesToRemove.push(enemy);

                        // Life gain every 10 kills
                        if (this.totalKills % 10 === 0) {
                            this.lives++;
                        }

                        // Extend active powerup durations
                        this.extendPowerupDurations();

                        // Create scaled explosion particles
                        this.createExplosion(enemy.x, enemy.y, enemy.color, enemy.type);

                        // Chance to spawn powerup
                        if (Math.random() < 0.2) {
                            this.powerups.push(new Powerup(enemy.x, enemy.y));
                        }

                        // Notify spawner of first enemy death for mega square unlock
                        this.enemySpawner.recordFirstEnemyDeath();
                    }
                } else {
                    // Normal collision: player takes damage
                    this.lives--;
                    if (this.lives <= 0) {
                        // Game over - trigger death screen
                        this.gameOver = true;
                    }
                    // Mark enemy for removal
                    enemiesToRemove.push(enemy);
                }
            }
        });

        // Projectiles vs enemies
        this.projectiles.forEach(projectile => {
            let projectileHit = false;
            let bounced = false;

            this.enemies.forEach(enemy => {
                if (projectileHit) return; // Skip if projectile already hit something

                const dx = projectile.x - enemy.x;
                const dy = projectile.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < projectile.size + enemy.size) {
                    projectileHit = true;

                    // Check if enemy will die from this hit
                    const enemyWillDie = enemy.currentHealth <= 1; // takeDamage() will reduce by 1

                    // Hit - damage enemy
                    enemy.takeDamage();

                    if (enemyWillDie && enemy.currentHealth <= 0) {
                        // Enemy destroyed
                        this.score += enemy.points;
                        this.totalKills++;
                        // Mark enemy for removal
                        enemiesToRemove.push(enemy);

                        // Life gain every 10 kills
                        if (this.totalKills % 10 === 0) {
                            this.lives++;
                        }

                        // Extend active powerup durations
                        this.extendPowerupDurations();

                        // Create scaled explosion particles
                        this.createExplosion(enemy.x, enemy.y, enemy.color, enemy.type);

                        // Chance to spawn powerup
                        if (Math.random() < 0.2) {
                            this.powerups.push(new Powerup(enemy.x, enemy.y));
                        }

                        // Tier 3 multiShot: projectile bouncing
                        if (projectile.bouncesRemaining > 0) {
                            // Find nearest other enemy to bounce to
                            let nearestEnemy = null;
                            let minDist = Infinity;
                            this.enemies.forEach(otherEnemy => {
                                if (otherEnemy !== enemy && !enemiesToRemove.includes(otherEnemy)) {
                                    const dx2 = projectile.x - otherEnemy.x;
                                    const dy2 = projectile.y - otherEnemy.y;
                                    const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                                    if (dist2 < minDist) {
                                        minDist = dist2;
                                        nearestEnemy = otherEnemy;
                                    }
                                }
                            });

                            if (nearestEnemy) {
                                // Redirect projectile to new enemy
                                const dx2 = nearestEnemy.x - projectile.x;
                                const dy2 = nearestEnemy.y - projectile.y;
                                const newAngle = Math.atan2(dy2, dx2);
                                const speed = Math.sqrt(projectile.vx * projectile.vx + projectile.vy * projectile.vy);
                                projectile.vx = Math.cos(newAngle) * speed;
                                projectile.vy = Math.sin(newAngle) * speed;
                                projectile.bouncesRemaining--;
                                bounced = true;
                                return; // Exit enemy loop, projectile continues
                            }
                        }
                    }

                    // Remove projectile if it hit but didn't bounce
                    if (!bounced) {
                        projectilesToRemove.push(projectile);
                    }
                }
            });
        });

        // Beam vs enemies
        if (this.player.beamData && this.player.beamData.length > 0) {
            const isTier3MultiShot = this.player.powerupTiers.multiShot === 3;

            this.player.beamData.forEach(beam => {
                this.enemies.forEach(enemy => {
                    const dx = enemy.x - this.player.x;
                    const dy = enemy.y - this.player.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= beam.length) {
                        const angleToEnemy = Math.atan2(dy, dx);
                        const angleDiff = Math.abs(angleToEnemy - beam.angle);
                        const normalizedDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);
                        if (normalizedDiff < 0.2) { // angle tolerance
                            enemy.takeDamage();
                            if (enemy.currentHealth <= 0) {
                                this.score += enemy.points;
                                this.totalKills++;
                                enemiesToRemove.push(enemy);
                                if (this.totalKills % 10 === 0) this.lives++;
                                this.extendPowerupDurations();
                                this.createExplosion(enemy.x, enemy.y, enemy.color, enemy.type);
                                if (Math.random() < 0.2) this.powerups.push(new Powerup(enemy.x, enemy.y));
                            }
                        }
                    }
                });
            });
        }

        // Mini-ship beams vs enemies
        this.miniShips.forEach(miniShip => {
            if (miniShip.beamData) {
                this.enemies.forEach(enemy => {
                    const dx = enemy.x - miniShip.x;
                    const dy = enemy.y - miniShip.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= miniShip.beamData.length) {
                        const angleToEnemy = Math.atan2(dy, dx);
                        const angleDiff = Math.abs(angleToEnemy - miniShip.beamData.angle);
                        const normalizedDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);
                        if (normalizedDiff < 0.2) { // angle tolerance
                            enemy.takeDamage();
                            if (enemy.currentHealth <= 0) {
                                this.score += enemy.points;
                                this.totalKills++;
                                enemiesToRemove.push(enemy);
                                if (this.totalKills % 10 === 0) this.lives++;
                                this.extendPowerupDurations();
                                this.createExplosion(enemy.x, enemy.y, enemy.color, enemy.type);
                                if (Math.random() < 0.2) this.powerups.push(new Powerup(enemy.x, enemy.y));
                            }
                        }
                    }
                });
            }
        });

        // Remove collected items
        this.projectiles = this.projectiles.filter(p => !projectilesToRemove.includes(p));
        this.enemies = this.enemies.filter(e => !enemiesToRemove.includes(e));

        // Player vs powerups
        this.powerups.forEach(powerup => {
            const dx = this.player.x - powerup.x;
            const dy = this.player.y - powerup.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < this.player.size + powerup.size) {
                // Collect powerup
                powerup.applyEffect(this.player, this.miniShips);

                // Add powerup text notification
                const powerupName = this.getPowerupDisplayName(powerup.type);
                this.powerupTexts.push({
                    text: powerupName,
                    x: this.player.x,
                    y: this.player.y - 40,
                    lifetime: 120, // 2 seconds at 60fps
                    color: powerup.color
                });

                this.powerups = this.powerups.filter(p => p !== powerup);
            }
        });
    }

    extendPowerupDurations() {
        // Extend active powerup durations by 1s per kill
        const extension = 60; // 1.0s at 60fps
        if (this.player.powerupEffects.rapidFire.duration > 0) {
            this.player.powerupEffects.rapidFire.duration += extension;
        }
        if (this.player.powerupEffects.speedBoost.duration > 0) {
            this.player.powerupEffects.speedBoost.duration += extension;
        }
        if (this.player.powerupEffects.multiShot.duration > 0) {
            this.player.powerupEffects.multiShot.duration += extension;
        }
        if (this.player.powerupEffects.miniShips.duration > 0) {
            this.player.powerupEffects.miniShips.duration += extension;
        }
        if (this.player.powerupEffects.magnet.duration > 0) {
            this.player.powerupEffects.magnet.duration += extension;
        }
    }

    getPowerupDisplayName(powerupType) {
        const names = {
            rapidFire: 'RAPID FIRE',
            speedBoost: 'SPEED BOOST',
            multiShot: 'MULTI SHOT',
            miniShips: 'MINI SHIPS',
            magnet: 'MAGNET'
        };
        return names[powerupType] || 'POWERUP';
    }

    createExplosion(x, y, color, enemyType) {
        const particleCount = getParticleConfig(enemyType).count;

        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Render game objects
        if (this.player) {
            this.player.render(this.ctx);
        }

        // Render enemies
        this.enemies.forEach(enemy => enemy.render(this.ctx));

        // Render projectiles
        this.projectiles.forEach(projectile => projectile.render(this.ctx));

        // Render particles
        this.particles.forEach(particle => particle.render(this.ctx));

        // Render powerups
        this.powerups.forEach(powerup => powerup.render(this.ctx));

        // Render mini ships
        this.miniShips.forEach(miniShip => miniShip.render(this.ctx));

        // Render powerup text notifications
        this.powerupTexts.forEach(text => {
            const alpha = Math.min(text.lifetime / 60, 1); // Fade in/out over 1 second
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = text.color;
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 3;
            this.ctx.strokeText(text.text, text.x, text.y);
            this.ctx.fillText(text.text, text.x, text.y);
            this.ctx.restore();
        });

        // Render UI
        this.renderUI();
    }

    renderUI() {
        if (this.gameOver) {
            // Game over screen
            this.ctx.fillStyle = '#f00';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('You Died', this.canvas.width / 2, this.canvas.height / 2 - 50);

            this.ctx.fillStyle = '#fff';
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
            this.ctx.fillText(`Total Kills: ${this.totalKills}`, this.canvas.width / 2, this.canvas.height / 2 + 60);
            this.ctx.fillText('Press any key to return to menu', this.canvas.width / 2, this.canvas.height / 2 + 120);
        } else {
            // Normal UI
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`Score: ${this.score}`, 10, 30);
            this.ctx.fillText(`Lives: ${this.lives}`, 10, 60);
            this.ctx.fillText(`Kills: ${this.totalKills}`, 10, 90);
            this.ctx.fillText(`Time: ${this.enemySpawner.getGameTimeFormatted()}`, 10, 120);
        }
    }

    gameLoop() {
        this.update();
        this.render();

        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    cleanup() {
        // Remove event listeners
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
            this.keydownHandler = null;
        }
        if (this.keyupHandler) {
            document.removeEventListener('keyup', this.keyupHandler);
            this.keyupHandler = null;
        }
    }
}
