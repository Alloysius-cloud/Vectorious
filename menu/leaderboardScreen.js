// Leaderboard screen implementation
class LeaderboardScreen extends MenuManager {
    constructor(canvas, ctx, app) {
        super(canvas, ctx, app);
        this.setupButtons();
    }

    setupButtons() {
        const centerX = this.canvas.width / 2 - MENU_BUTTON_CONFIG.width / 2;
        const buttonY = this.canvas.height - 80;

        this.buttons = [
            this.createButton('Back to Menu', centerX, buttonY, () => this.app.showTitleScreen())
        ];
    }

    show() {
        this.clearCanvas();
        this.setupButtons();
        this.setupEventListeners();
        this.render();
    }

    render() {
        this.clearCanvas();

        // Draw title
        this.drawTitle('Leaderboard', this.canvas.height / 2 - 120);

        // Show high score
        this.ctx.fillStyle = '#ff0';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`High Score: ${this.app.highScore}`, this.canvas.width / 2, this.canvas.height / 2 - 80);

        // Display leaderboard entries
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = '#fff';

        if (this.app.leaderboard.length === 0) {
            this.ctx.textAlign = 'center';
            this.ctx.fillText('No scores yet!', this.canvas.width / 2, this.canvas.height / 2);
        } else {
            const startY = this.canvas.height / 2 - 30;
            this.app.leaderboard.slice(0, 10).forEach((entry, index) => {
                const rank = (index + 1).toString().padStart(2, ' ');
                const initials = entry.initials.padEnd(3, ' ');
                const score = entry.score.toString().padStart(8, ' ');

                this.ctx.fillText(`${rank}. ${initials} ${score}`, this.canvas.width / 2 - 120, startY + index * 25);
            });
        }

        // Draw button
        this.buttons.forEach(button => this.drawButton(button));
    }

    handleKeyDown(e) {
        if (e.code === 'Escape' || e.code === 'Enter') {
            this.app.showTitleScreen();
        }
    }
}
