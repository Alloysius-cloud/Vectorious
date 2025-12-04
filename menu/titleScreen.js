// Title screen implementation
class TitleScreen extends MenuManager {
    constructor(canvas, ctx, app) {
        super(canvas, ctx, app);
        this.setupButtons();
    }

    setupButtons() {
        const centerX = this.canvas.width / 2 - MENU_BUTTON_CONFIG.width / 2;
        const startY = this.canvas.height / 2 - 50;

        this.buttons = [
            this.createButton('Start Game', centerX, startY, () => this.app.startGame()),
            this.createButton('Leaderboard', centerX, startY + 60, () => this.app.showLeaderboard()),
            this.createButton('Settings', centerX, startY + 120, () => this.app.showSettings()),
            this.createButton('Keyboard Options', centerX, startY + 180, () => this.app.showOptions())
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

        this.drawTitle('Vectorious');

        // Show high score
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`High Score: ${this.app.highScore}`, this.canvas.width / 2, this.canvas.height / 2 - 80);

        // Draw buttons
        this.buttons.forEach((button, index) => this.drawButton(button, index === this.selectedButtonIndex));

        // Draw navigation hints
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#888';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Use mouse or arrow keys and enter for navigation', this.canvas.width / 2, this.canvas.height - 30);
    }


}
