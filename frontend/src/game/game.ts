enum KeyBindings{
    UP = 'KeyW',
    DOWN = 'KeyS',
	P2UP = 'ArrowUp',
	P2DOWN = 'ArrowDown'
}

export class Game {
	private width: number = 800;
	private height: number = 600;
	private ball: ball;
	private players: player[] = [];
	private playerIdMap: Map<string, number> = new Map();
	private computer: computer;

	private gameCanvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;

	constructor(playerOne : string, playerTwo : string) {
		
		// Create a canvas element, set its dimensions, and attach it to the DOM.
		this.gameCanvas = document.createElement('canvas');
		this.gameCanvas.width = this.width;
		this.gameCanvas.height = this.height;
		const container = document.getElementById("game-container");
		if (container) {
			container.appendChild(this.gameCanvas);
			console.log("Canvas appended to container");
		} else {
			console.error("Game container not found");
		}
		this.ctx = this.gameCanvas.getContext('2d')!
		this.gameCanvas.width = 800;
		this.gameCanvas.height = 600;

		this.players[0] = new player(50, 20, 200, 0);
		this.playerIdMap.set(playerOne, 0);
		this.players[1] = new player(50, 20, 200, 780);
		this.playerIdMap.set(playerTwo, 1);
		this.ball = new ball(20, 20, this.height / 2, this.width / 2 - 10);
		this.computer = new computer(50, 20, 200, 780);
  
		document.addEventListener('keydown', (e) => {
			if (e.code === KeyBindings.UP || e.code === KeyBindings.DOWN) {
				this.players[0].getKeysPressed()[e.code] = true;
			}
			if (e.code === KeyBindings.P2UP || e.code === KeyBindings.P2DOWN) {
				this.players[1].getKeysPressed()[e.code] = true;
			}
		});
		
		document.addEventListener('keyup', (e) => {
			if (e.code === KeyBindings.UP || e.code === KeyBindings.DOWN) {
				this.players[0].getKeysPressed()[e.code] = false;
			}
			if (e.code === KeyBindings.P2UP || e.code === KeyBindings.P2DOWN) {
				this.players[1].getKeysPressed()[e.code] = false;
			}
		});

		setInterval(() => {
			this.update(this);
			this.updateGraphics();
		  }, 1000 / 60);
	}

	keyDown(e : {[key: string]: boolean }, playerID: string)
	{
		console.log(this.playerIdMap.get(playerID) + " : " + playerID);
		const playerIndex = this.playerIdMap.get(playerID);
		if (playerIndex !== undefined) {
			this.players[playerIndex].setKeysPressed(e);
		} else {
			console.error(`Player ID ${playerID} not found in playerIdMap.`);
		}
	}

	getPos()
	{
		return [this.players[0].getpos(), this.players[1].getpos(), this.ball.getpos()];
	}

	startGame() {
		// You might call Game.gameLoop(this) if you decide to use requestAnimationFrame.
	}

	static gameLoop(gameInstance: Game) 
	{
		gameInstance.update(gameInstance);
		gameInstance.updateGraphics();
		//gameInstance.ball.draw(gameInstance.ctx);
		//gameInstance.player.draw(gameInstance.ctx);
		//gameInstance.computer.draw(gameInstance.ctx);

		requestAnimationFrame(() => Game.gameLoop(gameInstance));
	}
	
	update(gameInstance: Game)
	{
		if (gameInstance.players[0].getKeysPressed()[KeyBindings.UP]) {
			gameInstance.players[0].setvel(-1);
		} else if (gameInstance.players[0].getKeysPressed()[KeyBindings.DOWN]) {
			gameInstance.players[0].setvel(1);
		} else {
			gameInstance.players[0].setvel(0);
		}
		gameInstance.players[0].move();

		if (gameInstance.players[1].getKeysPressed()[KeyBindings.P2UP]) {
			gameInstance.players[1].setvel(-1);
		} else if (gameInstance.players[1].getKeysPressed()[KeyBindings.P2DOWN]) {
			gameInstance.players[1].setvel(1);
		} else {
			gameInstance.players[1].setvel(0);
		}
		gameInstance.players[1].move();

		gameInstance.ball.update(gameInstance.players[0], gameInstance.players[1]);
		//gameInstance.computer.move(this.ball, this.gameCanvas);
	}

	updateGraphics() {
		// Clear the canvas.
		this.ctx.fillStyle = "#000";
		this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
		
		// Draw game elements.
		// For instance, draw the ball and players using their draw methods.
		this.ball.draw(this.ctx);
		this.players[0].draw(this.ctx);
		this.players[1].draw(this.ctx);
	  }
	}

// 	updateGraphics()
// 	{  
// 		//this.ctx.fillStyle = "#000";
//         //this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
		
// 		//for (var i = 0; i <= this.gameCanvas.height; i += 30) {
// 		//	this.ctx.fillStyle = "red";
// 		//	this.ctx.fillRect(this.gameCanvas.width / 2 - 10, i + 5, 15, 20);
// 		//}

// 		//this.ctx.fillStyle = "red";
// 		//this.ctx.fillRect(20, Game.testnum, 10, 50);
// 		//Game.testnum
// 	}
// }

class entity
{
	height: number;
	width: number;
	yPos: number;
	xPos: number;
	yVel: number = 0;
	xVel: number = 0;

	constructor(h:number, w:number, y:number, x:number)
	{
		this.height = h;
		this.width = w;
		this.yPos = y;
		this.xPos = x;
	}
	draw(ctx:CanvasRenderingContext2D)
	{
        ctx.fillStyle = "red";
        ctx.fillRect(this.xPos, this.yPos, this.width, this.height);
	}

	getpos()
	{
		return [this.yPos, this.xPos];
	}
}

class ball extends entity
{
	private speed:number = 6;

	constructor(h:number, w:number, y:number, x:number)
	{
		super(h, w, y, x);
		var randomDirection = Math.floor(Math.random() * 2) + 1; 
        if(randomDirection % 2){
            this.xVel = 1;
        }else{
            this.xVel = -1;
        }
        randomDirection = Math.floor(Math.random() * 2) + 1; 
        if(randomDirection % 2){
            this.yVel = 1;
        }else{
            this.yVel = -1;
        }
	}

	update(player:player, player2:player)
	{
		if (this.yPos >= 580)
			this.yVel = -1;
		else if (this.yPos <= 0)
			this.yVel = 1;

		if (this.xPos <= player.xPos + player.width &&
			this.yPos + this.height >= player.yPos && 
			this.yPos <= player.yPos + player.height) 
		{
			this.xVel = 1;
		}

		if (this.xPos + this.width >= player2.xPos &&
			this.yPos + this.height >= player2.yPos && 
			this.yPos <= player2.yPos + player2.height) 
		{
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

class player extends entity
{
	private speed:number = 4;
	private keysPressed: { [key: string]: boolean } = {};
	
	constructor(h:number, w:number, y:number, x:number)
	{
		super(h, w, y, x);
	}

	setvel(velocityY:number)
	{
		this.yVel = velocityY;
	}

	move()
	{
		this.yPos += this.yVel * this.speed;
	}

	getKeysPressed()
	{
		return this.keysPressed;
	}

	setKeysPressed(keys: { [key: string]: boolean })
	{
		this.keysPressed = keys;
	}

}


class computer extends entity
{
	private speed:number = 4;
	
	constructor(h:number, w:number, y:number, x:number)
	{
		super(h, w, y, x);
	}

	setvel(velocityY:number)
	{
		this.yVel = velocityY;
	}

	move(ball:ball, canvas:HTMLCanvasElement)
	{
		if(ball.yPos < this.yPos && ball.xVel == 1){
            this.yVel = -1; 
            
            if(this.yPos <= 20){
                this.yVel = 0;
            }
       }
       else if(ball.yPos > this.yPos + this.height && ball.xVel == 1){
           this.yVel = 1;
           
           if(this.yPos + this.height >= canvas.height - 20){
               this.yVel = 0;
           }
       }
       else{
           this.yVel = 0;
       }
       
        this.yPos += this.yVel * this.speed;
	}
}

export function startNewGame() {
	alert("Get ready to play!");
	const game = new Game("1", "2");
	game.startGame();
}