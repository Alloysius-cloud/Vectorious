// Powerup type definitions and constants
const POWERUP_TYPES = {
    RAPID_FIRE: 'rapidFire',
    SPEED_BOOST: 'speedBoost',
    MULTI_SHOT: 'multiShot',
    MINI_SHIPS: 'miniShips',
    MAGNET: 'magnet'
};

// Powerup configurations
const POWERUP_CONFIGS = {
    [POWERUP_TYPES.RAPID_FIRE]: {
        color: '#ff0',
        effect: POWERUP_TYPES.RAPID_FIRE,
        description: 'Increases fire rate and extends range',
        baseDuration: 300 // 5 seconds at 60fps
    },
    [POWERUP_TYPES.SPEED_BOOST]: {
        color: '#0ff',
        effect: POWERUP_TYPES.SPEED_BOOST,
        description: 'Increases movement speed',
        baseDuration: 300
    },
    [POWERUP_TYPES.MULTI_SHOT]: {
        color: '#f0f',
        effect: POWERUP_TYPES.MULTI_SHOT,
        description: 'Fires multiple projectiles',
        baseDuration: 300
    },
    [POWERUP_TYPES.MINI_SHIPS]: {
        color: '#f00',
        effect: POWERUP_TYPES.MINI_SHIPS,
        description: 'Spawns orbiting mini-ships',
        baseDuration: 300
    },
    [POWERUP_TYPES.MAGNET]: {
        color: '#f80',
        effect: POWERUP_TYPES.MAGNET,
        description: 'Attracts nearby powerups',
        baseDuration: 300
    }
};

// Enemy type configurations
const ENEMY_TYPES = {
    CIRCLE: 'circle',
    SQUARE: 'square',
    HEXAGON: 'hexagon'
};

const ENEMY_CONFIGS = {
    [ENEMY_TYPES.CIRCLE]: {
        maxHealth: 1,
        size: 12,
        color: '#0088ff',
        points: 10,
        spawnWeight: 0.6
    },
    [ENEMY_TYPES.SQUARE]: {
        maxHealth: 2,
        size: 16,
        color: '#ff4444',
        points: 25,
        spawnWeight: 0.25
    },
    [ENEMY_TYPES.HEXAGON]: {
        maxHealth: 5,
        size: 20,
        color: '#aa44ff',
        points: 100,
        spawnWeight: 0.15
    }
};

// Particle effect configurations
const PARTICLE_CONFIGS = {
    [ENEMY_TYPES.CIRCLE]: { count: 10 },
    [ENEMY_TYPES.SQUARE]: { count: 20 },
    [ENEMY_TYPES.HEXAGON]: { count: 50 }
};

// Helper functions
function getRandomPowerupType() {
    const types = Object.keys(POWERUP_CONFIGS);
    return types[Math.floor(Math.random() * types.length)];
}

function getPowerupConfig(type) {
    return POWERUP_CONFIGS[type];
}

function getRandomEnemyType() {
    const rand = Math.random();
    let cumulativeWeight = 0;

    for (const [type, config] of Object.entries(ENEMY_CONFIGS)) {
        cumulativeWeight += config.spawnWeight;
        if (rand <= cumulativeWeight) {
            return type;
        }
    }

    return ENEMY_TYPES.CIRCLE; // fallback
}

function getEnemyConfig(type) {
    return ENEMY_CONFIGS[type];
}

function getParticleConfig(enemyType) {
    return PARTICLE_CONFIGS[enemyType] || { count: 10 };
}
