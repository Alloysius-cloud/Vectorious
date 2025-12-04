class EnemySpawner {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        // Timing
        this.gameStartTime = null;
        this.firstEnemyDeathTime = null;
        this.megaSquareUnlocked = false;

        // Enemy management
        this.enemies = [];
        this.maxEnemies = 8; // Default, can be adjusted
        this.spawnRate = 0.02; // Base spawn chance per frame
    }

    startGame() {
        this.gameStartTime = Date.now();
        this.firstEnemyDeathTime = null;
        this.megaSquareUnlocked = false;
        this.enemies = [];
    }

    recordFirstEnemyDeath() {
        if (!this.firstEnemyDeathTime) {
            this.firstEnemyDeathTime = Date.now();
        }
    }

    update() {
        // Check if mega square should be unlocked (30 seconds from game start)
        if (!this.megaSquareUnlocked) {
            const gameTimeSeconds = this.gameStartTime ? (Date.now() - this.gameStartTime) / 1000 : 0;
            if (gameTimeSeconds >= 30) { // 30 seconds from game start
                this.megaSquareUnlocked = true;
            }
        }

        // Spawn new enemies
        if (this.enemies.length < this.maxEnemies && Math.random() < this.spawnRate) {
            const enemy = this.createEnemy();
            if (enemy) {
                this.enemies.push(enemy);
            }
        }

        // Update existing enemies
        this.enemies.forEach(enemy => {
            enemy.update(this.player, this.width, this.height);
        });

        // Remove dead enemies
        this.enemies = this.enemies.filter(enemy => enemy.currentHealth > 0);
    }

    createEnemy() {
        // Get game time in seconds (for difficulty scaling)
        const gameTimeSeconds = this.gameStartTime ? (Date.now() - this.gameStartTime) / 1000 : 0;

        // Get random enemy type based on current difficulty
        const enemyType = getWeightedRandomEnemyType(gameTimeSeconds, this.megaSquareUnlocked);

        // Create enemy at random edge position
        const side = Math.floor(Math.random() * 4);
        let x, y;

        switch (side) {
            case 0: // top
                x = Math.random() * this.width;
                y = -20;
                break;
            case 1: // right
                x = this.width + 20;
                y = Math.random() * this.height;
                break;
            case 2: // bottom
                x = Math.random() * this.width;
                y = this.height + 20;
                break;
            case 3: // left
                x = -20;
                y = Math.random() * this.height;
                break;
        }

        // Create enemy with proper configuration
        const config = getEnemyConfig(enemyType);
        if (!config) return null;

        const enemy = new Enemy(x, y, enemyType, config);
        return enemy;
    }

    getEnemies() {
        return this.enemies;
    }

    getGameTimeFormatted() {
        if (!this.gameStartTime) return "0:00";

        const elapsedMs = Date.now() - this.gameStartTime;
        const totalSeconds = Math.floor(elapsedMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    getGameTimeSeconds() {
        if (!this.gameStartTime) return 0;
        return (Date.now() - this.gameStartTime) / 1000;
    }

    isMegaSquareUnlocked() {
        return this.megaSquareUnlocked;
    }

    setPlayer(player) {
        this.player = player;
    }

    setMaxEnemies(count) {
        this.maxEnemies = count;
    }

    setSpawnRate(rate) {
        this.spawnRate = rate;
    }
}
