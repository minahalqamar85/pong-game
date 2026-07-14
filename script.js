// Get canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;

let player = {
    x: 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

let computer = {
    x: canvas.width - 30,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 4
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    size: ballSize,
    speed: 5
};

let score = {
    player: 0,
    computer: 0
};

let gameRunning = false;
let mouseY = canvas.height / 2;

// Event listeners
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
    }
    if (e.key === 'ArrowUp') {
        player.dy = -player.speed;
    }
    if (e.key === 'ArrowDown') {
        player.dy = player.speed;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        player.dy = 0;
    }
});

// Update player paddle position (mouse or keyboard)
function updatePlayerPaddle() {
    // Use mouse position if available
    if (mouseY > 0) {
        player.y = mouseY - paddleHeight / 2;
    } else {
        player.y += player.dy;
    }

    // Keep player paddle within canvas
    if (player.y < 0) {
        player.y = 0;
    }
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
}

// Update computer paddle (AI)
function updateComputerPaddle() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;

    // Simple AI: follow the ball
    if (computerCenter < ballCenter - 35) {
        computer.y += computer.speed;
    } else if (computerCenter > ballCenter + 35) {
        computer.y -= computer.speed;
    }

    // Keep computer paddle within canvas
    if (computer.y < 0) {
        computer.y = 0;
    }
    if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = ball.y - ball.size < 0 ? ball.size : canvas.height - ball.size;
    }

    // Ball collision with player paddle
    if (
        ball.x - ball.size < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.size;
        
        // Add spin based on paddle position
        let collidePoint = ball.y - (player.y + player.height / 2);
        collidePoint = collidePoint / (player.height / 2);
        ball.dy = collidePoint * ball.speed;
    }

    // Ball collision with computer paddle
    if (
        ball.x + ball.size > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.size;
        
        // Add spin based on paddle position
        let collidePoint = ball.y - (computer.y + computer.height / 2);
        collidePoint = collidePoint / (computer.height / 2);
        ball.dy = collidePoint * ball.speed;
    }

    // Ball out of bounds (left side - computer scores)
    if (ball.x < 0) {
        score.computer++;
        resetBall();
        gameRunning = false;
    }

    // Ball out of bounds (right side - player scores)
    if (ball.x > canvas.width) {
        score.player++;
        resetBall();
        gameRunning = false;
    }

    updateScore();
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * ball.speed;
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = score.player;
    document.getElementById('computerScore').textContent = score.computer;
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur = 10;
}

function drawBall() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur = 10;
}

function drawCenterLine() {
    ctx.strokeStyle = '#00d4ff';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGameStatus() {
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvas.width / 2 - 150, canvas.height / 2 - 50, 300, 100);
        
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to', canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillText('Start/Resume', canvas.width / 2, canvas.height / 2 + 20);
    }
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.shadowBlur = 0;

    // Draw center line
    drawCenterLine();

    // Update game state
    updatePlayerPaddle();
    updateComputerPaddle();
    
    if (gameRunning) {
        updateBall();
    }

    // Draw game objects
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();
    drawGameStatus();

    // Continue loop
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();