"use strict";
import { Logger, LogLevel } from '../utils/logger.js';

const log = new Logger(LogLevel.INFO);

const KeyBindings = {
	UP: "KeyW",
	DOWN: "KeyS"
};

class Entity {
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

	getpos() {
		return [this.yPos, this.xPos];
	}

	getPoints() {
		return this.points;
	}
}

class Ball extends Entity {
	constructor(h, w, y, x) {
		super(h, w, y, x);
		this.speed = 5;

		this.xVel = Math.random() < 0.5 ? 1 : -1;
		this.yVel = Math.random() < 0.5 ? 1 : -1;
	}

	update(player, player2) {
		if (this.yPos + this.height >= 600) this.yVel = -1;
		else if (this.yPos <= 0) this.yVel = 1;

		if (
			this.xPos <= player.xPos + player.width &&
			this.yPos + this.height >= player.yPos &&
			this.yPos <= player.yPos + player.height
		) {
			this.xVel = 1;
		}
		if (
			this.xPos + this.width >= player2.xPos &&
			this.yPos + this.height >= player2.yPos &&
			this.yPos <= player2.yPos + player2.height
		) {
			this.xVel = -1;
		}

		if (this.xPos <= 0) 
		{
			player.points++;
			this.xPos = 400 - this.width / 2;
			this.yVel = Math.random() < 0.5 ? 1 : -1;
		} else if (this.xPos + this.width >= 800)
		{
			player2.points++;
			this.xPos = 400 - this.width / 2;
			this.yVel = Math.random() < 0.5 ? 1 : -1;
		}
		this.xPos += this.xVel * this.speed;
		this.yPos += this.yVel * this.speed;
	}

	set(value)
	{
		this.height = Number(value.ballSize);
		this.width = Number(value.ballSize);
		this.speed = Number(value.ballSpeed);
	}
}

class Player extends Entity {
	constructor(h, w, y, x) {
		super(h, w, y, x);
		this.speed = 4;
		this.keysPressed = {};
		this.points = 0;
	}

	setvel(velocityY) {
		this.yVel = velocityY;
	}

	move() {
		if (this.yPos + this.height + this.yVel * this.speed >= 600) return;
		else if (this.yPos + this.yVel * this.speed <= 0) return;

		this.yPos += this.yVel * this.speed;
	}

	getKeysPressed() {
		return this.keysPressed;
	}

	setKeysPressed(keys) {
		this.keysPressed = keys;
	}
}

class Computer extends Entity {
	constructor(h, w, y, x) {
		super(h, w, y, x);
		this.speed = 4;
	}

	setvel(velocityY) {
		this.yVel = velocityY;
	}

	move(ball, canvas) {
		if (ball.yPos < this.yPos && ball.xVel === 1) {
			this.yVel = -1;
			if (this.yPos <= 20) this.yVel = 0;
		} else if (ball.yPos > this.yPos + this.height && ball.xVel === 1) {
			this.yVel = 1;
			if (this.yPos + this.height >= canvas.height - 20) this.yVel = 0;
		} else {
			this.yVel = 0;
		}
		this.yPos += this.yVel * this.speed;
	}
}

class Game {
	constructor(playerOne, playerTwo) {
		this.running = true;
		this.width = 800;
		this.height = 600;
		this.players = [];
		this.playerIdMap = new Map();

		this.players[0] = new Player(50, 20, 200, 0);
		this.playerIdMap.set(playerOne, 0);

		this.players[1] = new Player(50, 20, 200, 780);
		this.playerIdMap.set(playerTwo, 1);

		this.ball = new Ball(20, 20, this.height / 2, this.width / 2 - 10);
		this.computer = new Computer(50, 20, 200, 780);
	}

	settings(settings)
	{
		const {ballSettings, playerSettings} = settings;
		this.ball.set(ballSettings);
	}

	keyDown(e, playerID) {
		log.debug(`keyDown by player: ${this.playerIdMap.get(playerID)}, socket id: ${playerID}`);
		this.players[this.playerIdMap.get(playerID)].setKeysPressed(e);
	}

	getPos() {
		return [this.players[0].getpos(), this.players[1].getpos(), this.ball.getpos()];
	}

	getScores()
	{
		return [this.players[0].getPoints(), this.players[1].getPoints()];
	}

	update(gameInstance) {
		gameInstance.players.forEach(player => {
			if (player.getKeysPressed()[KeyBindings.UP]) {
				player.setvel(-1);
			} else if (player.getKeysPressed()[KeyBindings.DOWN]) {
				player.setvel(1);
			} else {
				player.setvel(0);
			}
			player.move();
		});

		gameInstance.ball.update(gameInstance.players[0], gameInstance.players[1]);
	}

	stop() {
		this.running = false;
	}

	isRunning()
	{
		return (this.running);
	}
}

export { Game };
