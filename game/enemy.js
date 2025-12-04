class Enemy {
    constructor(x, y, type, config) {
        this.x = x;
        this.y = y;

        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.speed = 0.5 + Math.random() * 1.5;

        // Set enemy properties from config
        this.type = type;
        this.maxHealth = config.maxHealth;
        this.size = config.size;
        this.color = config.color;
        this.points = config.points;

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

    isDead() {
        return this.currentHealth <= 0;
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
        const baseColor = this.color;

        // Enemy-specific glow effects
        let glowColor;
        if (this.type === 'circle') {
            glowColor = '#0088ff'; // Blue glow
        } else if (this.type === 'square') {
            glowColor = '#ff4444'; // Red glow
        } else if (this.type === 'hexagon') {
            glowColor = '#aa44ff'; // Purple glow
        } else if (this.type === 'megaSquare') {
            glowColor = '#00ff00'; // Green glow
        }

        // Layered stroke glow effect (no shadows needed)
        // Outer glow layer
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 6;
        this.drawShape(ctx, this.size);
        ctx.stroke();

        // Middle glow layer
        ctx.globalAlpha = 0.7;
        ctx.lineWidth = 4;
        this.drawShape(ctx, this.size);
        ctx.stroke();

        // Inner enemy shape
        ctx.globalAlpha = 1;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        this.drawShape(ctx, this.size);
        ctx.stroke();

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

    drawShape(ctx, size) {
        if (this.type === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
        } else if (this.type === 'square' || this.type === 'megaSquare') {
            ctx.strokeRect(-size / 2, -size / 2, size, size);
        } else if (this.type === 'hexagon') {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const x = Math.cos(angle) * size;
                const y = Math.sin(angle) * size;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
        }
    }
}
