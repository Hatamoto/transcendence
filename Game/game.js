var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var KeyBindings;
(function (KeyBindings) {
    KeyBindings["UP"] = "KeyW";
    KeyBindings["DOWN"] = "KeyS";
})(KeyBindings || (KeyBindings = {}));
var Game = /** @class */ (function () {
    function Game() {
        this.gameCanvas = document.createElement("canvas");
        document.body.appendChild(this.gameCanvas);
        this.ctx = this.gameCanvas.getContext("2d");
        this.gameCanvas.width = 800;
        this.gameCanvas.height = 600;
        this.player = new player(50, 20, 200, 0);
        this.ball = new ball(20, 20, this.gameCanvas.height / 2, this.gameCanvas.width / 2 - 10);
        this.computer = new computer(50, 20, 200, 780);
        document.addEventListener('keydown', function (e) {
            Game.keysPressed[e.code] = true;
        });
        document.addEventListener('keyup', function (e) {
            Game.keysPressed[e.code] = false;
        });
    }
    Game.gameLoop = function (gameInstance) {
        gameInstance.update(gameInstance);
        gameInstance.updateGraphics();
        gameInstance.ball.draw(gameInstance.ctx);
        gameInstance.player.draw(gameInstance.ctx);
        gameInstance.computer.draw(gameInstance.ctx);
        requestAnimationFrame(function () { return Game.gameLoop(gameInstance); });
    };
    Game.prototype.update = function (gameInstance) {
        if (Game.keysPressed[KeyBindings.UP]) {
            gameInstance.player.setvel(-1);
        }
        else if (Game.keysPressed[KeyBindings.DOWN]) {
            gameInstance.player.setvel(1);
        }
        else {
            gameInstance.player.setvel(0);
        }
        gameInstance.ball.update(this.player, this.computer);
        gameInstance.player.move();
        gameInstance.computer.move(this.ball, this.gameCanvas);
    };
    Game.prototype.updateGraphics = function () {
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        for (var i = 0; i <= this.gameCanvas.height; i += 30) {
            this.ctx.fillStyle = "red";
            this.ctx.fillRect(this.gameCanvas.width / 2 - 10, i + 5, 15, 20);
        }
        //this.ctx.fillStyle = "red";
        //this.ctx.fillRect(20, Game.testnum, 10, 50);
        //Game.testnum
    };
    Game.keysPressed = [];
    return Game;
}());
var entity = /** @class */ (function () {
    function entity(h, w, y, x) {
        this.yVel = 0;
        this.xVel = 0;
        this.height = h;
        this.width = w;
        this.yPos = y;
        this.xPos = x;
    }
    entity.prototype.draw = function (ctx) {
        ctx.fillStyle = "red";
        ctx.fillRect(this.xPos, this.yPos, this.width, this.height);
    };
    return entity;
}());
var ball = /** @class */ (function (_super) {
    __extends(ball, _super);
    function ball(h, w, y, x) {
        var _this = _super.call(this, h, w, y, x) || this;
        _this.speed = 6;
        var randomDirection = Math.floor(Math.random() * 2) + 1;
        if (randomDirection % 2) {
            _this.xVel = 1;
        }
        else {
            _this.xVel = -1;
        }
        randomDirection = Math.floor(Math.random() * 2) + 1;
        if (randomDirection % 2) {
            _this.yVel = 1;
        }
        else {
            _this.yVel = -1;
        }
        return _this;
    }
    ball.prototype.update = function (player, computer) {
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
    };
    return ball;
}(entity));
var player = /** @class */ (function (_super) {
    __extends(player, _super);
    function player(h, w, y, x) {
        var _this = _super.call(this, h, w, y, x) || this;
        _this.speed = 4;
        return _this;
    }
    player.prototype.setvel = function (velocityY) {
        this.yVel = velocityY;
    };
    player.prototype.move = function () {
        this.yPos += this.yVel * this.speed;
    };
    player.prototype.getpos = function () {
        return [this.yPos, this.xPos];
    };
    return player;
}(entity));
var computer = /** @class */ (function (_super) {
    __extends(computer, _super);
    function computer(h, w, y, x) {
        var _this = _super.call(this, h, w, y, x) || this;
        _this.speed = 4;
        return _this;
    }
    computer.prototype.setvel = function (velocityY) {
        this.yVel = velocityY;
    };
    computer.prototype.move = function (ball, canvas) {
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
    };
    computer.prototype.getpos = function () {
        return [this.yPos, this.xPos];
    };
    return computer;
}(entity));
var game = new Game();
requestAnimationFrame(function () { return Game.gameLoop(game); });
