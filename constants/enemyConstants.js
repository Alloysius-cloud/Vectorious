// Enemy type definitions and configurations
const ENEMY_TYPES = {
    CIRCLE: 'circle',
    SQUARE: 'square',
    HEXAGON: 'hexagon',
    MEGA_SQUARE: 'megaSquare'
};

const ENEMY_CONFIGS = {
    [ENEMY_TYPES.CIRCLE]: {
        maxHealth: 1,
        size: 12,
        color: '#0088ff',
        points: 10,
        baseSpawnWeight: 0.6
    },
    [ENEMY_TYPES.SQUARE]: {
        maxHealth: 2,
        size: 16,
        color: '#ff4444',
        points: 25,
        baseSpawnWeight: 0.25
    },
    [ENEMY_TYPES.HEXAGON]: {
        maxHealth: 5,
        size: 20,
        color: '#aa44ff',
        points: 100,
        baseSpawnWeight: 0.15
    },
    [ENEMY_TYPES.MEGA_SQUARE]: {
        maxHealth: 10,
        size: 24,
        color: '#00ff00',
        points: 200,
        baseSpawnWeight: 0.1 // Base weight for scaling calculations
    }
};

// Particle effect configurations for enemy explosions
const PARTICLE_CONFIGS = {
    [ENEMY_TYPES.CIRCLE]: { count: 10 },
    [ENEMY_TYPES.SQUARE]: { count: 20 },
    [ENEMY_TYPES.HEXAGON]: { count: 50 },
    [ENEMY_TYPES.MEGA_SQUARE]: { count: 80 }
};

// Difficulty scaling curves (time in seconds, spawn weight multipliers)
const DIFFICULTY_SCALING = {
    // Time ranges and their difficulty multipliers
    ranges: [
        { maxTime: 120, circle: 1.0, square: 1.0, hexagon: 1.0, megaSquare: 0.3 }, // 0-2 min: Mega squares allowed when unlocked
        { maxTime: 300, circle: 0.5, square: 0.8, hexagon: 1.0, megaSquare: 0.3 }, // 2-5 min: Mega squares start appearing
        { maxTime: 600, circle: 0.1, square: 0.1, hexagon: 0.1, megaSquare: 9.0 }, // 5-10 min: Mega squares dominate (90%)
        { maxTime: Infinity, circle: 0.0, square: 0.0, hexagon: 0.0, megaSquare: 15.0 } // 10+ min: Only mega squares (100%)
    ]
};

// Timing constants
const MEGA_SQUARE_UNLOCK_TIME = 120; // 2 minutes in seconds

// Helper functions
function getEnemyConfig(type) {
    return ENEMY_CONFIGS[type];
}

function getParticleConfig(enemyType) {
    return PARTICLE_CONFIGS[enemyType] || { count: 10 };
}

function getDifficultyMultiplier(gameTimeSeconds) {
    for (const range of DIFFICULTY_SCALING.ranges) {
        if (gameTimeSeconds <= range.maxTime) {
            return {
                circle: range.circle,
                square: range.square,
                hexagon: range.hexagon,
                megaSquare: range.megaSquare
            };
        }
    }
    return DIFFICULTY_SCALING.ranges[DIFFICULTY_SCALING.ranges.length - 1];
}

function getWeightedRandomEnemyType(gameTimeSeconds, megaSquareUnlocked) {
    const multipliers = getDifficultyMultiplier(gameTimeSeconds);

    // Calculate adjusted weights
    const weights = {};
    for (const [type, config] of Object.entries(ENEMY_CONFIGS)) {
        // Use type directly as multiplier key (e.g., 'circle', 'megaSquare')
        const typeKey = type;
        let weight = config.baseSpawnWeight * multipliers[typeKey];

        // Special case: mega square only spawns if unlocked
        if (type === ENEMY_TYPES.MEGA_SQUARE && !megaSquareUnlocked) {
            weight = 0;
        }

        weights[type] = weight;
    }

    // Normalize weights to sum to 1
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    if (totalWeight === 0) return ENEMY_TYPES.CIRCLE; // Fallback

    for (const [type, weight] of Object.entries(weights)) {
        weights[type] = weight / totalWeight;
    }

    // Weighted random selection
    const rand = Math.random();
    let cumulativeWeight = 0;

    for (const [type, weight] of Object.entries(weights)) {
        cumulativeWeight += weight;
        if (rand <= cumulativeWeight) {
            return type;
        }
    }

    return ENEMY_TYPES.CIRCLE; // Fallback
}
