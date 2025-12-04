// Base menu manager with shared functionality for all menu screens
class MenuManager {
    constructor(canvas, ctx, app) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.app = app;
        this.buttons = [];
        this.selectedButton = 0;
    }

    // Shared button creation and management
    createButton(text, x, y, action) {
        return {
            text,
            x,
            y,
            width: MENU_BUTTON_CONFIG.width,
            height: MENU_BUTTON_CONFIG.height,
            action,
            isHovered: false
        };
    }

    // Draw a button
    drawButton(button, isSelected = false) {
        // Button background
        this.ctx.fillStyle = button.isHovered ? '#666' : '#444';
        this.ctx.fillRect(button.x, button.y, button.width, button.height);

        // Button border
        this.ctx.strokeStyle = isSelected ? '#ff0' : '#fff';
        this.ctx.lineWidth = MENU_BUTTON_CONFIG.borderWidth;
        this.ctx.strokeRect(button.x, button.y, button.width, button.height);

        // Button text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `${MENU_BUTTON_CONFIG.fontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            button.text,
            button.x + button.width / 2,
            button.y + button.height / 2 + 7
        );
    }

    // Handle mouse events
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        this.buttons.forEach(button => {
            button.isHovered = mouseX >= button.x && mouseX <= button.x + button.width &&
                              mouseY >= button.y && mouseY <= button.y + button.height;
        });
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        this.buttons.forEach(button => {
            if (clickX >= button.x && clickX <= button.x + button.width &&
                clickY >= button.y && clickY <= button.y + button.height) {
                button.action();
            }
        });
    }

    // Handle keyboard navigation
    handleKeyDown(e) {
        // Override in subclasses as needed
    }

    // Setup event listeners
    setupEventListeners() {
        this.mouseMoveHandler = (e) => this.handleMouseMove(e);
        this.clickHandler = (e) => this.handleClick(e);
        this.keyDownHandler = (e) => this.handleKeyDown(e);

        this.canvas.addEventListener('mousemove', this.mouseMoveHandler);
        this.canvas.addEventListener('click', this.clickHandler);
        document.addEventListener('keydown', this.keyDownHandler);
    }

    // Cleanup event listeners
    cleanupEventListeners() {
        if (this.mouseMoveHandler) {
            this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
        }
        if (this.clickHandler) {
            this.canvas.removeEventListener('click', this.clickHandler);
        }
        if (this.keyDownHandler) {
            document.removeEventListener('keydown', this.keyDownHandler);
        }
    }

    // Draw title text
    drawTitle(text, y = this.canvas.height / 2 - 150) {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `${MENU_CONFIG.TITLE_FONT_SIZE}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, this.canvas.width / 2, y);
    }

    // Draw subtitle text
    drawSubtitle(text, y) {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `${MENU_CONFIG.SUBTITLE_FONT_SIZE}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, this.canvas.width / 2, y);
    }

    // Clear canvas
    clearCanvas() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Show the menu (to be implemented by subclasses)
    show() {
        // Override in subclasses
    }

    // Hide the menu
    hide() {
        this.cleanupEventListeners();
    }
}
