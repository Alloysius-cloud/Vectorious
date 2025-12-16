// Powerup type definitions and constants
const POWERUP_TYPES = {
    RAPID_FIRE: 'rapidFire',
    SPEED_BOOST: 'speedBoost',
    MULTI_SHOT: 'multiShot',
    MINI_SHIPS: 'miniShips',
    MAGNET: 'magnet',
    LASER_BEAM: 'laserBeam'
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
    },
    [POWERUP_TYPES.LASER_BEAM]: {
        color: '#0f0',
        effect: POWERUP_TYPES.LASER_BEAM,
        description: 'Charges up a devastating laser beam',
        baseDuration: 1500 // 25 seconds at 60fps
    }
};

// Helper functions
function getRandomPowerupType() {
    const types = Object.keys(POWERUP_CONFIGS);
    return types[Math.floor(Math.random() * types.length)];
}

function getPowerupConfig(type) {
    return POWERUP_CONFIGS[type];
}
