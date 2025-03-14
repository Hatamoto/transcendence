var KeyBindings;
(function (KeyBindings) {
    KeyBindings["UP"] = "KeyW";
    KeyBindings["DOWN"] = "KeyS";
})(KeyBindings || (KeyBindings = {}));
export class Game {
    constructor(playerOne, playerTwo) {
        this.width = 800;
        this.height = 600;
        this.players = [];
        this.playerIdMap = new Map();
        this.players[0] = new player(50, 20, 200, 0);
        this.playerIdMap.set(playerOne, 0);
        this.players[1] = new player(50, 20, 200, 780);
        this.playerIdMap.set(playerTwo, 1);
        this.ball = new ball(20, 20, this.height / 2, this.width / 2 - 10);
        this.computer = new computer(50, 20, 200, 780);
        //document.addEventListener('keydown', (e) => 
        //{
        //	Game.keysPressed[e.code] = true;
        //});
        //document.addEventListener('keyup', (e) => 
        //{
        //	Game.keysPressed[e.code] = false;
        //});
    }
    keyDown(e, playerID) {
        console.log(this.playerIdMap.get(playerID) + " : " + playerID);
        this.players[this.playerIdMap.get(playerID)].setKeysPressed(e);
    }
    getPlayerPos() {
        return [this.players[0].getpos()[0], this.players[1].getpos()[0]];
    }
    startGame() {
        // start calling gameloop here
    }
    static gameLoop(gameInstance) {
        gameInstance.update(gameInstance);
        gameInstance.updateGraphics();
        //gameInstance.ball.draw(gameInstance.ctx);
        //gameInstance.player.draw(gameInstance.ctx);
        //gameInstance.computer.draw(gameInstance.ctx);
        requestAnimationFrame(() => Game.gameLoop(gameInstance));
    }
    update(gameInstance) {
        for (var i = 0; i < gameInstance.players.length; i++) {
            if (gameInstance.players[i].getKeysPressed()[KeyBindings.UP]) {
                gameInstance.players[i].setvel(-1);
            }
            else if (gameInstance.players[i].getKeysPressed()[KeyBindings.DOWN]) {
                gameInstance.players[i].setvel(1);
            }
            else {
                gameInstance.players[i].setvel(0);
            }
            //gameInstance.ball.update(this.player, this.computer);
            gameInstance.players[i].move();
        }
        //gameInstance.computer.move(this.ball, this.gameCanvas);
    }
    updateGraphics() {
        //this.ctx.fillStyle = "#000";
        //this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        //for (var i = 0; i <= this.gameCanvas.height; i += 30) {
        //	this.ctx.fillStyle = "red";
        //	this.ctx.fillRect(this.gameCanvas.width / 2 - 10, i + 5, 15, 20);
        //}
        //this.ctx.fillStyle = "red";
        //this.ctx.fillRect(20, Game.testnum, 10, 50);
        //Game.testnum
    }
}
class entity {
    constructor(h, w, y, x) {
        this.yVel = 0;
        this.xVel = 0;
        this.height = h;
        this.width = w;
        this.yPos = y;
        this.xPos = x;
    }
    draw(ctx) {
        ctx.fillStyle = "red";
        ctx.fillRect(this.xPos, this.yPos, this.width, this.height);
    }
}
class ball extends entity {
    constructor(h, w, y, x) {
        super(h, w, y, x);
        this.speed = 6;
        var randomDirection = Math.floor(Math.random() * 2) + 1;
        if (randomDirection % 2) {
            this.xVel = 1;
        }
        else {
            this.xVel = -1;
        }
        randomDirection = Math.floor(Math.random() * 2) + 1;
        if (randomDirection % 2) {
            this.yVel = 1;
        }
        else {
            this.yVel = -1;
        }
    }
    update(player, computer) {
        console.log(this.xPos + " :x:y: " + this.yPos);
        if (this.yPos >= 580)
            this.yVel = -1;
        else if (this.yPos <= 0)
            this.yVel = 1;
        if (this.xPos <= player.xPos + player.width &&
            this.yPos + this.height >= player.yPos &&
            this.yPos <= player.yPos + player.height) {
            this.xVel = 1;
        }
        if (this.xPos + this.width >= computer.xPos &&
            this.yPos + this.height >= computer.yPos &&
            this.yPos <= computer.yPos + computer.height) {
            this.xVel = -1;
        }
        if (this.xPos <= 0)
            this.xPos = 400 - 10;
        else if (this.xPos >= 800)
            this.xPos = 400 - 10;
        this.xPos += this.xVel * this.speed;
        this.yPos += this.yVel * this.speed;
    }
}
class player extends entity {
    constructor(h, w, y, x) {
        super(h, w, y, x);
        this.speed = 4;
        this.keysPressed = {};
    }
    setvel(velocityY) {
        this.yVel = velocityY;
    }
    move() {
        this.yPos += this.yVel * this.speed;
    }
    getpos() {
        return [this.yPos, this.xPos];
    }
    getKeysPressed() {
        return this.keysPressed;
    }
    setKeysPressed(keys) {
        this.keysPressed = keys;
    }
}
class computer extends entity {
    constructor(h, w, y, x) {
        super(h, w, y, x);
        this.speed = 4;
    }
    setvel(velocityY) {
        this.yVel = velocityY;
    }
    move(ball, canvas) {
        if (ball.yPos < this.yPos && ball.xVel == 1) {
            this.yVel = -1;
            if (this.yPos <= 20) {
                this.yVel = 0;
            }
        }
        else if (ball.yPos > this.yPos + this.height && ball.xVel == 1) {
            this.yVel = 1;
            if (this.yPos + this.height >= canvas.height - 20) {
                this.yVel = 0;
            }
        }
        else {
            this.yVel = 0;
        }
        this.yPos += this.yVel * this.speed;
    }
    getpos() {
        return [this.yPos, this.xPos];
    }
}
//const game = new Game();
//requestAnimationFrame(() => Game.gameLoop(game));
