# Vectorious

A 2D top-down shooter game built with vanilla JavaScript and HTML5 Canvas. 
Control your ship, battle waves of geometric enemies, and collect powerups to survive as long as possible.

## Gameplay

Collect powerups that spawn randomly after enemy defeats to gain temporary advantages. 
The game ends when you run out of lives, with scoring based on enemy kills.

## Features

### Enemies
- **Circles**: Basic enemy (1 hit, 10 points)
- **Squares**: Armoured enemy (2 hits, 25 points)
- **Hexagons**: Heavy enemy (5 hits, 100 points)
- **Green Mega Squares**: Heavy Armoured enemy (10 hits, 200 points) 
- Enemies spawn continuously up to a configurable maximum
- Different explosion particle effects based on enemy type

### Powerups
Powerups spawn randomly (20% chance) when enemies are destroyed and provide temporary effects:

- **Rapid Fire** (Yellow): Increases firing rate and extends projectile range (stacks)
- **Speed Boost** (Cyan): Doubles movement speed (stacks)
- **Multi-Shot** (Magenta): Fires multiple projectiles simultaneously (stacks)
- **Mini-Ships** (Red): Spawns companion ships that auto-shoot (stacks, tier upgrades)
- **Magnet** (Orange): Attracts powerups from a distance (stacks)
- **Laser Beam** (Green): Automatically fires a death star laser after charging up (stacks, tier upgrades)

### Scoring & Lives
- Points awarded based on enemy type destroyed
- Extra life granted every 10 kills
- Active powerup durations extend with each kill
- High scores and leaderboard (top 10) with initials entry

### Customization
- **Settings**: Adjust starting lives (3-10) and maximum enemies (10-50)
- **Key Bindings**: Fully customisable controls via options menu
- All settings and scores persist in browser local storage

## Installation & Running

1. Download or clone the repository
2. Open `index.html` in any modern web browser
3. The game runs entirely in the browser

## Controls

### Default Key Bindings
- **Movement**: WASD keys
- **Shoot**: Spacebar
- **Remap Shoot Key**: R (press R then desired key)

### Menu Navigation
- Use arrow keys to navigate menus
- Enter to select/confirm
- ESC to return to previous screen

### Debug Powerups (Development)
- Press 1-5 during gameplay to test powerups:
  - 1: Rapid Fire
  - 2: Speed Boost
  - 3: Multi-Shot
  - 4: Mini-Ships
  - 5: Magnet


## Technical Details

- Built with vanilla JavaScript (ES6+)
- HTML5 Canvas for rendering
- Local storage for persistence

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Canvas
- ES6 features (classes, arrow functions, etc.)
- Local Storage API
