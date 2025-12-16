class Powerup {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = 8;
        this.lifetime = 600; // 10 seconds at 60fps

        // Random type (weighted for rarity)
        const types = ['rapidFire', 'rapidFire', 'speedBoost', 'speedBoost', 'multiShot', 'multiShot', 'miniShips', 'miniShips', 'magnet', 'magnet', 'laserBeam'];
        this.type = types[Math.floor(Math.random() * types.length)];

        // Colors
        switch (this.type) {
            case 'rapidFire':
                this.color = '#ff0'; // yellow
                break;
            case 'speedBoost':
                this.color = '#0ff'; // cyan
                break;
            case 'multiShot':
                this.color = '#f0f'; // magenta
                break;
            case 'miniShips':
                this.color = '#f00'; // red
                break;
            case 'magnet':
                this.color = '#f80'; // orange
                break;
            case 'laserBeam':
                this.color = '#0f0'; // green
                break;
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.lifetime--;
    }

    isDead() {
        return this.lifetime <= 0;
    }

    applyEffect(player, miniShips) {
        const duration = 300; // 5 seconds
        switch (this.type) {
            case 'rapidFire':
                player.powerupEffects.rapidFire.duration = duration;
                player.powerupEffects.rapidFire.stacks++;
                break;
            case 'speedBoost':
                player.powerupEffects.speedBoost.duration = duration;
                player.powerupEffects.speedBoost.stacks++;
                break;
            case 'multiShot':
                player.powerupEffects.multiShot.duration = duration;
                player.powerupEffects.multiShot.stacks++;
                break;
            case 'miniShips':
                player.powerupEffects.miniShips.duration = duration;
                player.powerupEffects.miniShips.stacks++;
                // Determine tier based on stacks
                const tier = player.powerupEffects.miniShips.stacks >= 5 ? 2 : 1;
                // Spawn 2 mini ships per pickup
                miniShips.push(new MiniShip(player));
                miniShips.push(new MiniShip(player));
                // Offset their angles
                if (miniShips.length >= 2) {
                    miniShips[miniShips.length - 1].angle = Math.PI;
                    miniShips[miniShips.length - 2].angle = 0;
                }
                break;
            case 'magnet':
                player.powerupEffects.magnet.duration = duration;
                player.powerupEffects.magnet.stacks++;
                break;
            case 'laserBeam':
                player.powerupEffects.laserBeam.duration = duration * 5; // 25 seconds
                player.powerupEffects.laserBeam.stacks++;
                break;
        }
    }

    render(ctx) {
        // Pulsing glow effect using layered rendering
        const pulse = (Math.sin(Date.now() / 300) + 1) / 2; // 0 to 1 pulsing

        // Outer glow layer
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2 - 3, this.y - this.size / 2 - 3, this.size + 6, this.size + 6);

        // Middle glow layer
        ctx.globalAlpha = 0.7;
        ctx.fillRect(this.x - this.size / 2 - 2, this.y - this.size / 2 - 2, this.size + 4, this.size + 4);

        // Inner pulsing core
        ctx.globalAlpha = 1;
        const coreSize = this.size * (0.8 + pulse * 0.4); // Size pulses
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - coreSize / 2, this.y - coreSize / 2, coreSize, coreSize);

        // Bright center dot
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = pulse * 0.8;
        ctx.fillRect(this.x - 2, this.y - 2, 4, 4);
        ctx.globalAlpha = 1;
    }
}
