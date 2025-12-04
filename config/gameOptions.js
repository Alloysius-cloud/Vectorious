// Game configuration and default settings
const GAME_CONFIG = {
    // Canvas settings
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,

    // Game settings
    DEFAULT_STARTING_LIVES: 3,
    MIN_STARTING_LIVES: 3,
    MAX_STARTING_LIVES: 10,

    DEFAULT_MAX_ENEMIES: 20,
    MIN_MAX_ENEMIES: 10,
    MAX_MAX_ENEMIES: 50,

    // Game mechanics
    LIFE_GAIN_INTERVAL: 10, // kills needed for extra life
    POWERUP_SPAWN_CHANCE: 0.2, // 20% chance per enemy death
    ENEMY_SPAWN_RATE: 0.02, // base spawn rate

    // Physics
    PLAYER_SPEED: 0.2,
    PLAYER_FRICTION: 0.98,
    PLAYER_SIZE: 15,

    ENEMY_SPEED_BASE: 0.5,
    ENEMY_SPEED_VARIANCE: 1.5,

    PROJECTILE_SPEED: 5,
    PROJECTILE_LIFETIME: 120, // frames

    MAGNET_SPEED: 3,
    MAGNET_MIN_DISTANCE: 30,

    // Powerups
    POWERUP_DURATION: 300, // 5 seconds at 60fps
    POWERUP_DURATION_EXTENSION: 60, // 1 second extension per kill
    RAPID_FIRE_RATE_MULTIPLIER: 0.5, // 50% faster shooting
    RAPID_FIRE_RANGE_MULTIPLIER_BASE: 0.5, // +50% range per stack
    RAPID_FIRE_MAX_RANGE_MULTIPLIER: 3, // max 3x range
    SPEED_BOOST_MULTIPLIER: 2, // 2x speed

    // Mini-ships
    MINISHIP_ORBIT_RADIUS_BASE: 50,
    MINISHIP_ORBIT_RADIUS_TIER2: 60,
    MINISHIP_SHOOT_RATE_BASE: 15,
    MINISHIP_SHOOT_RATE_TIER2: 20,

    // Magnet
    MAGNET_RADIUS_BASE: 100,
    MAGNET_RADIUS_PER_STACK: 50,

    // UI
    UI_FONT_SIZE: 20,
    UI_SCORE_X: 10,
    UI_SCORE_Y: 30,
    UI_LIVES_X: 10,
    UI_LIVES_Y: 60,
    UI_KILLS_X: 10,
    UI_KILLS_Y: 90,

    // Leaderboard
    LEADERBOARD_SIZE: 10,

    // Key mappings (defaults)
    DEFAULT_KEY_MAPPINGS: {
        up: 'KeyW',
        down: 'KeyS',
        left: 'KeyA',
        right: 'KeyD',
        shoot: 'Space',
        remap: 'KeyR'
    }
};

// Default game state
const DEFAULT_GAME_STATE = {
    score: 0,
    lives: GAME_CONFIG.DEFAULT_STARTING_LIVES,
    totalKills: 0,
    gameOver: false
};

// Menu button configurations
const MENU_BUTTON_CONFIG = {
    width: 200,
    height: 40,
    margin: 10,
    fontSize: 20,
    borderWidth: 2
};

// Menu screen configurations
const MENU_CONFIG = {
    TITLE_FONT_SIZE: 48,
    SUBTITLE_FONT_SIZE: 24,
    BUTTON_FONT_SIZE: 20,
    SPACING: 50
};
