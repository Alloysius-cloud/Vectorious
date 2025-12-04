class Game {
    constructor(canvas, ctx, settings, onGameOver) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        this.onGameOver = onGameOver;

        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.powerups = [];
        this.miniShips = [];

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
            remap: 'KeyR'
        };

        this.isRemapping = false;
        this.remapKey = null;
        this.animationId = null; // For stopping the game loop

        // Load saved key mappings
        const savedMappings = localStorage.getItem('keyMappings');
        if (savedMappings) {
            this.keyMappings = { ...this.keyMappings, ...JSON.parse(savedMappings) };
        }

        this.init();
        this.setupEventListeners();
        this.gameLoop();
    }

    init() {
        // Initialize game objects
        this.player = new Player(this.width / 2, this.height / 2);
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
                            // Determine tier based on stacks
                            const tier = this.player.powerupEffects.miniShips.stacks >= 3 ? 2 : 1;
                            // Spawn 2 mini ships per pickup
                            this.miniShips.push(new MiniShip(this.player, tier));
                            this.miniShips.push(new MiniShip(this.player, tier));
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
                localStorage.setItem('keyMappings', JSON.stringify(this.keyMappings));
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

        window.addEventListener('keydown', this.keydownHandler);
        window.addEventListener('keyup', this.keyupHandler);
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

        // Spawn enemies (limit to maxEnemies)
        if (this.enemies.length < this.maxEnemies && Math.random() < 0.02) {
            this.enemies.push(new Enemy(this.width, this.height));
        }

        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(this.player, this.width, this.height);
        });

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
                // Player hit
                this.lives--;
                if (this.lives <= 0) {
                    // Game over - trigger death screen
                    this.gameOver = true;
                }
                // Mark enemy for removal
                enemiesToRemove.push(enemy);
            }
        });

        // Projectiles vs enemies
        this.projectiles.forEach(projectile => {
            this.enemies.forEach(enemy => {
                const dx = projectile.x - enemy.x;
                const dy = projectile.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < projectile.size + enemy.size) {
                    // Hit - damage enemy
                    enemy.takeDamage();
                    // Mark projectile for removal
                    projectilesToRemove.push(projectile);

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
                    }
                }
            });
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

    createExplosion(x, y, color, enemyType) {
        let particleCount = 10; // default for circle
        if (enemyType === 'square') particleCount = 20;
        else if (enemyType === 'hexagon') particleCount = 50;

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
            window.removeEventListener('keydown', this.keydownHandler);
            this.keydownHandler = null;
        }
        if (this.keyupHandler) {
            window.removeEventListener('keyup', this.keyupHandler);
            this.keyupHandler = null;
        }
    }
}
