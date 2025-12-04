class Powerup {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = 8;
        this.lifetime = 600; // 10 seconds at 60fps

        // Random type
        const types = ['rapidFire', 'speedBoost', 'multiShot', 'miniShips', 'magnet'];
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
        }
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }
}
