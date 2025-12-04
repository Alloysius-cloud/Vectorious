class App {
    constructor() {
        this.state = 'title';
        this.game = null;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentScreen = null;

        // Game settings
        this.settings = {
            startingLives: 3,
            maxEnemies: 20
        };

        // Menu screens
        this.titleScreen = new TitleScreen(this.canvas, this.ctx, this);
        this.leaderboardScreen = new LeaderboardScreen(this.canvas, this.ctx, this);

        // High score and leaderboard data
        this.highScore = 0;
        this.leaderboard = [];
        this.pendingScore = 0;

        // Load saved data
        this.loadGameData();

        // Make canvas full screen
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.showTitleScreen();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.game) {
            this.game.width = this.canvas.width;
            this.game.height = this.canvas.height;
        }
    }

    setupEventListeners() {
        // Will be handled by individual screens
    }

    showOptions() {
        if (this.currentScreen) {
            this.currentScreen.hide();
        }
        this.currentScreen = null; // Options screen doesn't use the menu system
        this.state = 'options';
        this.clearCanvas();

        // Draw options screen
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Options', this.canvas.width / 2, 100);

        this.ctx.font = '20px Arial';
        this.ctx.fillText('Key Bindings:', this.canvas.width / 2, 200);

        // Display current bindings
        const actions = ['up', 'down', 'left', 'right', 'shoot'];
        const labels = ['Up', 'Down', 'Left', 'Right', 'Shoot'];

        actions.forEach((action, index) => {
            const keyName = this.getKeyName(action);
            this.ctx.fillText(`${index + 1}. ${labels[index]}: ${keyName}`, this.canvas.width / 2, 250 + index * 30);
        });

        this.ctx.fillText('Press 1-5 to select action to rebind', this.canvas.width / 2, 450);
        this.ctx.fillText('Then press the new key', this.canvas.width / 2, 480);
        this.ctx.fillText('Press ESC to return to title', this.canvas.width / 2, 520);

        // Options input handling
        this.rebindAction = null;
        const optionsKeyHandler = (e) => {
            if (e.code === 'Escape') {
                document.removeEventListener('keydown', optionsKeyHandler);
                this.titleScreen.show();
            } else if (!this.rebindAction) {
                // Select action to rebind
                const num = parseInt(e.key);
                if (num >= 1 && num <= 5) {
                    this.rebindAction = actions[num - 1];
                    this.ctx.fillText(`Press new key for ${labels[num - 1]}...`, this.canvas.width / 2, 550);
                }
            } else {
                // Rebind the key
                const keyMappings = { ...this.game?.keyMappings } || {
                    up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', shoot: 'Space', remap: 'KeyR'
                };
                keyMappings[this.rebindAction] = e.code;
                localStorage.setItem('keyMappings', JSON.stringify(keyMappings));
                console.log('Key rebound:', keyMappings);
                // Refresh options screen
                document.removeEventListener('keydown', optionsKeyHandler);
                this.showOptions();
            }
        };
        document.addEventListener('keydown', optionsKeyHandler);
    }

    getKeyName(action) {
        const keyMappings = this.game?.keyMappings || {
            up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', shoot: 'Space', remap: 'KeyR'
        };
        const code = keyMappings[action];
        // Convert code to readable name
        const keyNames = {
            'KeyW': 'W', 'KeyA': 'A', 'KeyS': 'S', 'KeyD': 'D',
            'ArrowUp': '↑', 'ArrowDown': '↓', 'ArrowLeft': '←', 'ArrowRight': '→',
            'Space': 'Space', 'Enter': 'Enter', 'Escape': 'Esc'
        };
        return keyNames[code] || code.replace('Key', '');
    }

    showSettings() {
        if (this.currentScreen) {
            this.currentScreen.hide();
        }
        this.currentScreen = null; // Settings screen doesn't use the menu system
        this.state = 'settings';
        this.clearCanvas();

        // Draw settings screen
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Settings', this.canvas.width / 2, 100);

        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Starting Lives: ${this.settings.startingLives}`, this.canvas.width / 2, 200);
        this.ctx.fillText(`Max Enemies: ${this.settings.maxEnemies}`, this.canvas.width / 2, 250);

        this.ctx.font = '18px Arial';
        this.ctx.fillText('Use arrow keys to adjust values', this.canvas.width / 2, 350);
        this.ctx.fillText('Up/Down: Select setting', this.canvas.width / 2, 380);
        this.ctx.fillText('Left/Right: Change value', this.canvas.width / 2, 410);
        this.ctx.fillText('Press Enter to save and return', this.canvas.width / 2, 450);
        this.ctx.fillText('Press ESC to cancel', this.canvas.width / 2, 480);

        // Settings input handling
        let selectedSetting = 0; // 0 = lives, 1 = enemies
        const settingsKeyHandler = (e) => {
            if (e.code === 'Escape') {
                document.removeEventListener('keydown', settingsKeyHandler);
                this.titleScreen.show();
            } else if (e.code === 'Enter') {
                // Save settings
                localStorage.setItem('gameSettings', JSON.stringify(this.settings));
                document.removeEventListener('keydown', settingsKeyHandler);
                this.showTitleScreen();
            } else if (e.code === 'ArrowUp') {
                selectedSetting = Math.max(0, selectedSetting - 1);
                this.redrawSettings(selectedSetting);
            } else if (e.code === 'ArrowDown') {
                selectedSetting = Math.min(1, selectedSetting + 1);
                this.redrawSettings(selectedSetting);
            } else if (e.code === 'ArrowLeft') {
                if (selectedSetting === 0) {
                    this.settings.startingLives = Math.max(3, this.settings.startingLives - 1);
                } else {
                    this.settings.maxEnemies = Math.max(10, this.settings.maxEnemies - 5);
                }
                this.redrawSettings(selectedSetting);
            } else if (e.code === 'ArrowRight') {
                if (selectedSetting === 0) {
                    this.settings.startingLives = Math.min(10, this.settings.startingLives + 1);
                } else {
                    this.settings.maxEnemies = Math.min(50, this.settings.maxEnemies + 5);
                }
                this.redrawSettings(selectedSetting);
            }
        };
        document.addEventListener('keydown', settingsKeyHandler);
    }

    redrawSettings(selectedSetting) {
        this.clearCanvas();

        // Redraw the settings screen
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Settings', this.canvas.width / 2, 100);

        this.ctx.font = '24px Arial';
        const livesColor = selectedSetting === 0 ? '#ff0' : '#fff';
        const enemiesColor = selectedSetting === 1 ? '#ff0' : '#fff';

        this.ctx.fillStyle = livesColor;
        this.ctx.fillText(`Starting Lives: ${this.settings.startingLives}`, this.canvas.width / 2, 200);

        this.ctx.fillStyle = enemiesColor;
        this.ctx.fillText(`Max Enemies: ${this.settings.maxEnemies}`, this.canvas.width / 2, 250);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Use arrow keys to adjust values', this.canvas.width / 2, 350);
        this.ctx.fillText('Up/Down: Select setting', this.canvas.width / 2, 380);
        this.ctx.fillText('Left/Right: Change value', this.canvas.width / 2, 410);
        this.ctx.fillText('Press Enter to save and return', this.canvas.width / 2, 450);
        this.ctx.fillText('Press ESC to cancel', this.canvas.width / 2, 480);
    }

    loadGameData() {
        // Load high score
        const savedHighScore = localStorage.getItem('highScore');
        if (savedHighScore) {
            this.highScore = parseInt(savedHighScore);
        }

        // Load leaderboard
        const savedLeaderboard = localStorage.getItem('leaderboard');
        if (savedLeaderboard) {
            this.leaderboard = JSON.parse(savedLeaderboard);
        }
    }

    saveGameData() {
        localStorage.setItem('highScore', this.highScore.toString());
        localStorage.setItem('leaderboard', JSON.stringify(this.leaderboard));
    }

    checkHighScore(score) {
        // Update high score
        if (score > this.highScore) {
            this.highScore = score;
        }

        // Check if score qualifies for leaderboard (top 10 or better than existing)
        const qualifies = this.leaderboard.length < 10 || score > Math.min(...this.leaderboard.map(entry => entry.score));

        if (qualifies) {
            this.pendingScore = score;
            this.showInitialsEntry();
        } else {
            this.saveGameData();
            this.titleScreen.show();
        }
    }

    showInitialsEntry() {
        if (this.currentScreen) {
            this.currentScreen.hide();
        }
        this.currentScreen = null; // Initials entry doesn't use menu system
        this.state = 'enterInitials';
        this.clearCanvas();

        // Draw initials entry screen
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('New High Score!', this.canvas.width / 2, this.canvas.height / 2 - 100);

        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Score: ${this.pendingScore}`, this.canvas.width / 2, this.canvas.height / 2 - 50);

        this.ctx.font = '20px Arial';
        this.ctx.fillText('Enter your initials (3 letters):', this.canvas.width / 2, this.canvas.height / 2);

        // Initials input state
        this.currentInitials = ['', '', ''];
        this.initialsIndex = 0;

        this.drawInitialsInput();

        // Input handling for initials
        const initialsKeyHandler = (e) => {
            console.log('Key pressed:', e.code, e.key); // Debug logging

            if (e.code === 'Enter' && this.currentInitials.every(char => char !== '')) {
                e.preventDefault();
                console.log('Saving initials:', this.currentInitials.join(''));

                // Save the entry
                const entry = {
                    initials: this.currentInitials.join(''),
                    score: this.pendingScore
                };

                // Add to leaderboard and sort
                this.leaderboard.push(entry);
                this.leaderboard.sort((a, b) => b.score - a.score);
                this.leaderboard = this.leaderboard.slice(0, 10); // Keep top 10

                this.saveGameData();
                document.removeEventListener('keydown', initialsKeyHandler);
                this.titleScreen.show();
            } else if (e.code === 'Backspace') {
                e.preventDefault();
                if (this.initialsIndex > 0) {
                    this.initialsIndex--;
                    this.currentInitials[this.initialsIndex] = '';
                    this.drawInitialsInput();
                }
            } else if (this.initialsIndex < 3) {
                // More robust letter detection
                const key = e.key.toUpperCase();
                if (key >= 'A' && key <= 'Z') {
                    e.preventDefault();
                    this.currentInitials[this.initialsIndex] = key;
                    this.initialsIndex++;
                    this.drawInitialsInput();
                }
            }
        };

        // Use arrow function to ensure proper 'this' binding
        const boundHandler = initialsKeyHandler.bind(this);
        document.addEventListener('keydown', boundHandler);
    }

    drawInitialsInput() {
        // Clear the input area
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(this.canvas.width / 2 - 100, this.canvas.height / 2 + 20, 200, 60);

        // Draw the initials
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '32px Arial';
        this.ctx.textAlign = 'center';

        const initialsText = this.currentInitials.map((char, index) => {
            if (index === this.initialsIndex && char === '') {
                return '_';
            }
            return char || '_';
        }).join(' ');

        this.ctx.fillText(initialsText, this.canvas.width / 2, this.canvas.height / 2 + 60);

        this.ctx.font = '16px Arial';
        this.ctx.fillText('Press Enter when done', this.canvas.width / 2, this.canvas.height / 2 + 100);
    }

    showTitleScreen() {
        if (this.currentScreen) {
            this.currentScreen.hide();
        }
        this.currentScreen = this.titleScreen;
        this.state = 'title';
        this.titleScreen.show();
    }

    showLeaderboard() {
        if (this.currentScreen) {
            this.currentScreen.hide();
        }
        this.currentScreen = this.leaderboardScreen;
        this.state = 'leaderboard';
        this.leaderboardScreen.show();
    }

    startGame() {
        if (this.currentScreen) {
            this.currentScreen.hide();
        }
        this.currentScreen = null; // Game handles its own lifecycle
        this.state = 'game';
        this.game = new Game(this.canvas, this.ctx, this.settings, (score) => this.checkHighScore(score));
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Initialize app when page loads
window.addEventListener('load', () => {
    new App();
});
