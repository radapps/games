class KnightDuelGame {
    constructor() {
        this.boardSize = 8;
        this.board = [];
        this.currentPlayer = 1;
        this.selectedSquare = null;
        this.validMoves = [];
        this.gameOver = false;
        this.winner = null;
        this.colorScheme = 0;
        this.allowCapture = true;
        this.isPlayer1CPU = false;
        this.isPlayer2CPU = false;
        
        this.loadSettings();
        this.initializeBoard();
        this.setupEventListeners();
        this.render();
        
        if (this.isCurrentPlayerCPU()) {
            setTimeout(() => this.cpuTurn(), 500);
        }
    }
    
    loadSettings() {
        this.colorScheme = parseInt(localStorage.getItem('colorScheme') || '0');
        this.boardSize = parseInt(localStorage.getItem('boardSize') || '8');
        this.allowCapture = localStorage.getItem('allowCapture') !== 'false';
        this.isPlayer1CPU = localStorage.getItem('isPlayer1CPU') === 'true';
        this.isPlayer2CPU = localStorage.getItem('isPlayer2CPU') === 'true';
    }
    
    saveSettings() {
        localStorage.setItem('colorScheme', this.colorScheme);
        localStorage.setItem('boardSize', this.boardSize);
        localStorage.setItem('allowCapture', this.allowCapture);
        localStorage.setItem('isPlayer1CPU', this.isPlayer1CPU);
        localStorage.setItem('isPlayer2CPU', this.isPlayer2CPU);
    }
    
    initializeBoard() {
        this.board = Array(this.boardSize).fill(null).map(() =>
            Array(this.boardSize).fill(null).map(() => ({ piece: null, burned: false }))
        );
        
        this.board[0][1] = { piece: 1, burned: false };
        this.board[this.boardSize - 1][this.boardSize - 2] = { piece: 2, burned: false };
        
        this.currentPlayer = 1;
        this.selectedSquare = null;
        this.validMoves = [];
        this.gameOver = false;
        this.winner = null;
    }
    
    setupEventListeners() {
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('settingsBtn').addEventListener('click', () => this.toggleSettings());
        document.getElementById('closeSettingsBtn').addEventListener('click', () => {
            this.applySettings();
            this.toggleSettings();
            this.reset();
        });
        
        document.querySelectorAll('.color-scheme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.colorScheme = parseInt(e.currentTarget.dataset.scheme);
                this.updateColorSchemeButtons();
            });
        });
        
        document.getElementById('player1CPUCheck').addEventListener('change', (e) => {
            this.isPlayer1CPU = e.target.checked;
            if (e.target.checked) {
                document.getElementById('player2CPUCheck').checked = false;
                this.isPlayer2CPU = false;
            }
        });
        
        document.getElementById('player2CPUCheck').addEventListener('change', (e) => {
            this.isPlayer2CPU = e.target.checked;
            if (e.target.checked) {
                document.getElementById('player1CPUCheck').checked = false;
                this.isPlayer1CPU = false;
            }
        });
    }
    
    toggleSettings() {
        const panel = document.getElementById('settingsPanel');
        panel.classList.toggle('hidden');
        
        if (!panel.classList.contains('hidden')) {
            this.updateSettingsUI();
        }
    }
    
    updateSettingsUI() {
        this.updateColorSchemeButtons();
        document.getElementById('boardSizeSelect').value = this.boardSize;
        document.getElementById('allowCaptureCheck').checked = this.allowCapture;
        document.getElementById('player1CPUCheck').checked = this.isPlayer1CPU;
        document.getElementById('player2CPUCheck').checked = this.isPlayer2CPU;
    }
    
    updateColorSchemeButtons() {
        document.querySelectorAll('.color-scheme-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.scheme) === this.colorScheme);
        });
    }
    
    applySettings() {
        this.boardSize = parseInt(document.getElementById('boardSizeSelect').value);
        this.allowCapture = document.getElementById('allowCaptureCheck').checked;
        this.isPlayer1CPU = document.getElementById('player1CPUCheck').checked;
        this.isPlayer2CPU = document.getElementById('player2CPUCheck').checked;
        this.saveSettings();
    }
    
    getKnightMoves(row, col) {
        const moves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        const validMoves = [];
        
        moves.forEach(([dr, dc]) => {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (newRow >= 0 && newRow < this.boardSize && newCol >= 0 && newCol < this.boardSize) {
                const square = this.board[newRow][newCol];
                if (square.burned) return;
                
                if (!this.allowCapture && square.piece && square.piece !== this.currentPlayer) {
                    return;
                }
                
                validMoves.push([newRow, newCol]);
            }
        });
        
        return validMoves;
    }
    
    findKnight(player) {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col].piece === player) {
                    return [row, col];
                }
            }
        }
        return null;
    }
    
    handleSquareClick(row, col) {
        if (this.gameOver || this.isCurrentPlayerCPU()) return;
        
        const square = this.board[row][col];
        
        if (square.piece === this.currentPlayer) {
            this.selectedSquare = [row, col];
            this.validMoves = this.getKnightMoves(row, col);
            this.render();
            return;
        }
        
        if (this.selectedSquare) {
            const isValid = this.validMoves.some(([r, c]) => r === row && c === col);
            
            if (isValid) {
                this.makeMove(this.selectedSquare, [row, col]);
            }
            
            this.selectedSquare = null;
            this.validMoves = [];
            this.render();
        }
    }
    
    makeMove(from, to) {
        const [fromRow, fromCol] = from;
        const [toRow, toCol] = to;
        
        const capturedPiece = this.board[toRow][toCol].piece;
        
        this.board[toRow][toCol] = { piece: this.currentPlayer, burned: false };
        this.board[fromRow][fromCol] = { piece: null, burned: true };
        
        if (this.allowCapture && capturedPiece) {
            this.gameOver = true;
            this.winner = this.currentPlayer;
            this.render();
            return;
        }
        
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        
        const nextKnightPos = this.findKnight(this.currentPlayer);
        if (!nextKnightPos || this.getKnightMoves(nextKnightPos[0], nextKnightPos[1]).length === 0) {
            this.gameOver = true;
            this.winner = this.currentPlayer === 1 ? 2 : 1;
        }
        
        this.render();
        
        if (this.isCurrentPlayerCPU() && !this.gameOver) {
            setTimeout(() => this.cpuTurn(), 1000);
        }
    }
    
    isCurrentPlayerCPU() {
        return (this.currentPlayer === 1 && this.isPlayer1CPU) ||
               (this.currentPlayer === 2 && this.isPlayer2CPU);
    }
    
    async cpuTurn() {
        if (!this.isCurrentPlayerCPU() || this.gameOver) return;
        
        const knightPos = this.findKnight(this.currentPlayer);
        if (!knightPos) return;
        
        this.selectedSquare = knightPos;
        this.validMoves = this.getKnightMoves(knightPos[0], knightPos[1]);
        this.render();
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const move = this.chooseBestCPUMove(knightPos, this.validMoves);
        if (move) {
            this.makeMove(knightPos, move);
        }
        
        this.selectedSquare = null;
        this.validMoves = [];
    }
    
    chooseBestCPUMove(knightPos, possibleMoves) {
        if (possibleMoves.length === 0) return null;
        
        const opponentPlayer = this.currentPlayer === 1 ? 2 : 1;
        const opponentPos = this.findKnight(opponentPlayer);
        
        const dangerSquares = opponentPos ? this.getKnightMoves(opponentPos[0], opponentPos[1]) : [];
        
        const safeMoves = possibleMoves.filter(([row, col]) =>
            !dangerSquares.some(([r, c]) => r === row && c === col)
        );
        
        const movesToUse = safeMoves.length > 0 ? safeMoves : possibleMoves;
        return movesToUse[Math.floor(Math.random() * movesToUse.length)];
    }
    
    getSquareColor(row, col) {
        const isLight = (row + col) % 2 === 0;
        
        const schemes = [
            { light: '#F0D9B5', dark: '#B58863' },
            { light: '#E0E7FF', dark: '#4F46E5' },
            { light: '#DCFCE7', dark: '#16A34A' }
        ];
        
        const scheme = schemes[this.colorScheme];
        return isLight ? scheme.light : scheme.dark;
    }
    
    render() {
        const boardEl = document.getElementById('chessboard');
        boardEl.innerHTML = '';
        boardEl.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
        boardEl.style.gridTemplateRows = `repeat(${this.boardSize}, 1fr)`;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const square = this.board[row][col];
                const squareEl = document.createElement('button');
                squareEl.className = 'square';
                squareEl.style.background = this.getSquareColor(row, col);
                
                if (this.selectedSquare && this.selectedSquare[0] === row && this.selectedSquare[1] === col) {
                    squareEl.classList.add('selected');
                }
                
                if (this.validMoves.some(([r, c]) => r === row && c === col)) {
                    squareEl.classList.add('valid-move');
                }
                
                if (square.burned) {
                    squareEl.classList.add('burned');
                    squareEl.innerHTML = '🔥';
                } else if (square.piece === 1) {
                    squareEl.innerHTML = '♞';
                    squareEl.style.color = '#000';
                } else if (square.piece === 2) {
                    squareEl.innerHTML = '♞';
                    squareEl.style.color = '#fff';
                    squareEl.style.textShadow = '0 0 3px #000, 0 0 3px #000, 0 0 3px #000';
                }
                
                squareEl.addEventListener('click', () => this.handleSquareClick(row, col));
                boardEl.appendChild(squareEl);
            }
        }
        
        document.getElementById('currentPlayer').textContent = `Current Turn: Player ${this.currentPlayer}`;
        
        const winnerMsg = document.getElementById('winnerMessage');
        if (this.gameOver && this.winner) {
            winnerMsg.classList.remove('hidden');
            document.getElementById('winnerText').textContent = `Player ${this.winner} Wins!`;
            document.getElementById('gameStatus').style.display = 'none';
        } else {
            winnerMsg.classList.add('hidden');
            document.getElementById('gameStatus').style.display = 'block';
        }
    }
    
    reset() {
        this.initializeBoard();
        this.render();
        
        if (this.isCurrentPlayerCPU()) {
            setTimeout(() => this.cpuTurn(), 500);
        }
    }
}

// Start the game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new KnightDuelGame();
});
