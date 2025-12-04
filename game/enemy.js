class Enemy {
    constructor(width, height) {
        // Spawn from edges
        const side = Math.floor(Math.random() * 4);
        switch (side) {
            case 0: // top
                this.x = Math.random() * width;
                this.y = -20;
                break;
            case 1: // right
                this.x = width + 20;
                this.y = Math.random() * height;
                break;
            case 2: // bottom
                this.x = Math.random() * width;
                this.y = height + 20;
                break;
            case 3: // left
                this.x = -20;
                this.y = Math.random() * height;
                break;
        }

        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.speed = 0.5 + Math.random() * 1.5;

        // Enemy types with weighted spawning
        const rand = Math.random();
        if (rand < 0.6) {
            // Blue Circle - 60% chance
            this.type = 'circle';
            this.maxHealth = 1;
            this.size = 12;
            this.color = '#0088ff';
            this.points = 10;
        } else if (rand < 0.85) {
            // Red Square - 25% chance
            this.type = 'square';
            this.maxHealth = 2;
            this.size = 16;
            this.color = '#ff4444';
            this.points = 25;
        } else {
            // Purple Hexagon - 15% chance
            this.type = 'hexagon';
            this.maxHealth = 5;
            this.size = 20;
            this.color = '#aa44ff';
            this.points = 100;
        }

        this.currentHealth = this.maxHealth;
    }

    update(player, width, height) {
        // Move towards player with some randomness
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            this.vx += (dx / dist) * 0.01;
            this.vy += (dy / dist) * 0.01;
        }

        // Limit speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.speed) {
            this.vx = (this.vx / speed) * this.speed;
            this.vy = (this.vy / speed) * this.speed;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Screen wrapping
        if (this.x < -50) this.x = width + 50;
        if (this.x > width + 50) this.x = -50;
        if (this.y < -50) this.y = height + 50;
        if (this.y > height + 50) this.y = -50;
    }

    takeDamage() {
        this.currentHealth--;
        // Visual feedback - darken color based on health
        const healthRatio = this.currentHealth / this.maxHealth;
        const baseColor = this.color;
        // Simple darkening effect
        this.displayColor = healthRatio < 1 ? `hsl(${this.getHue(baseColor)}, 70%, ${30 + healthRatio * 40}%)` : this.color;
    }

    getHue(color) {
        // Extract hue from hex color for HSL manipulation
        const r = parseInt(color.slice(1, 3), 16) / 255;
        const g = parseInt(color.slice(3, 5), 16) / 255;
        const b = parseInt(color.slice(5, 7), 16) / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h;
        if (max === min) h = 0;
        else if (max === r) h = (60 * ((g - b) / (max - min)) + 360) % 360;
        else if (max === g) h = 60 * ((b - r) / (max - min)) + 120;
        else h = 60 * ((r - g) / (max - min)) + 240;
        return h;
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        const color = this.displayColor || this.color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        if (this.type === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === 'square') {
            ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else if (this.type === 'hexagon') {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const x = Math.cos(angle) * this.size;
                const y = Math.sin(angle) * this.size;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }

        // Health bar for multi-hit enemies
        if (this.maxHealth > 1) {
            const barWidth = this.size * 1.5;
            const barHeight = 4;
            const barY = -this.size - 8;

            // Background bar
            ctx.fillStyle = '#333';
            ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);

            // Health bar
            const healthRatio = this.currentHealth / this.maxHealth;
            const healthWidth = barWidth * healthRatio;

            // Gradient from green to red
            const gradient = ctx.createLinearGradient(-barWidth / 2, 0, barWidth / 2, 0);
            gradient.addColorStop(0, '#f00'); // red
            gradient.addColorStop(1, '#0f0'); // green

            ctx.fillStyle = gradient;
            ctx.fillRect(-barWidth / 2, barY, healthWidth, barHeight);
        }

        ctx.restore();
    }
}
