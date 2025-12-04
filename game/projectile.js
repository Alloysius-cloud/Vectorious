class Projectile {
    constructor(x, y, angle, rainbow = false, rangeMultiplier = 1, type = 'player') {
        this.x = x;
        this.y = y;
        const baseSpeed = type === 'miniShip' ? 4 : 5; // mini-ships slightly slower
        this.vx = Math.cos(angle) * baseSpeed;
        this.vy = Math.sin(angle) * baseSpeed;
        this.size = type === 'miniShip' ? 4 : 3; // mini-ship projectiles larger
        this.baseLifetime = type === 'miniShip' ? 100 : 120; // mini-ship projectiles shorter range
        this.lifetime = Math.floor(this.baseLifetime * rangeMultiplier); // extended by rapid fire
        this.rainbow = rainbow;
        this.type = type;
        this.creationTime = Date.now();
    }

    update(width, height) {
        this.x += this.vx;
        this.y += this.vy;
        this.lifetime--;

        // Screen wrapping
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
    }

    isDead() {
        return this.lifetime <= 0;
    }

    render(ctx) {
        if (this.type === 'miniShip') {
            // Mini-ship projectiles: green, elongated rectangle
            ctx.fillStyle = '#0f0';
            const length = this.size * 3;
            const width = this.size * 0.6;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(Math.atan2(this.vy, this.vx));
            ctx.fillRect(-length / 2, -width / 2, length, width);
            ctx.restore();
        } else {
            // Player projectiles: circular, rainbow or white
            if (this.rainbow) {
                const hue = (Date.now() / 2) % 360; // Cycle hue over time (5x faster)
                ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            } else {
                ctx.fillStyle = '#fff';
            }
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
