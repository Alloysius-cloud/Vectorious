class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.size = 2 + Math.random() * 3;
        this.lifetime = 30 + Math.random() * 30; // frames
        this.color = color;
        this.alpha = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98; // friction
        this.vy *= 0.98;
        this.lifetime--;
        this.alpha = this.lifetime / 60; // assuming max lifetime 60
    }

    isDead() {
        return this.lifetime <= 0;
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
