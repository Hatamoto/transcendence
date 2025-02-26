enum KeyBindings{
    UP = 'KeyW',
    DOWN = 'KeyS'
}

class Game {
	private static keysPressed: boolean[] = [];
	private gameCanvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private static testnum: number = 50;
	private ball: ball;
	private player: player;

	constructor() {
		this.player = new player(50, 20, 200, 0);
		this.ball = new ball(20, 20, 100, 300);

		this.gameCanvas = document.createElement("canvas");
		document.body.appendChild(this.gameCanvas);
		this.gameCanvas.width = 800;
		this.gameCanvas.height = 600;
		this.ctx = this.gameCanvas.getContext("2d")!;
  
		document.addEventListener('keydown', (e) => 
		{
			Game.keysPressed[e.code] = true;
		});

		document.addEventListener('keyup', (e) => 
		{
			Game.keysPressed[e.code] = false;
		});

		this.ctx.strokeStyle = "red";
		this.ctx.lineWidth = 5;
		this.ctx.strokeRect(10,10,this.gameCanvas.width - 20 ,this.gameCanvas.height - 20);
	  
		for (var i = 0; i + 30 < this.gameCanvas.height; i += 30) {
			this.ctx.fillStyle = "red";
			this.ctx.fillRect(this.gameCanvas.width / 2 - 10, i + 10, 15, 20);
		}
	}

	static gameLoop(gameInstance: Game) 
	{
		gameInstance.update(gameInstance);
		gameInstance.updateGraphics();
		gameInstance.ball.draw(gameInstance.ctx);
		gameInstance.player.draw(gameInstance.ctx);

		requestAnimationFrame(() => Game.gameLoop(gameInstance));
	}
	
	update(gameInstance: Game)
	{
		if (Game.keysPressed[KeyBindings.UP])
		{
			gameInstance.player.setvel(-1);
		}
		else if (Game.keysPressed[KeyBindings.DOWN])
		{
			gameInstance.player.setvel(1);
		}
		else
		{
			gameInstance.player.setvel(0);
		}
		gameInstance.ball.update(this.player);
		gameInstance.player.move();
	}

	updateGraphics()
	{  
		this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0,0,this.gameCanvas.width,this.gameCanvas.height);
		
		for (var i = 0; i + 30 < this.gameCanvas.height; i += 30) {
			this.ctx.fillStyle = "red";
			this.ctx.fillRect(this.gameCanvas.width / 2 - 10, i + 10, 15, 20);
		}

		//this.ctx.fillStyle = "red";
		//this.ctx.fillRect(20, Game.testnum, 10, 50);
		//Game.testnum
	}
}

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
}

class ball extends entity
{
	private speed:number = 2;

	constructor(h:number, w:number, y:number, x:number)
	{
		super(h, w, y, x);
		var randomDirection = Math.floor(Math.random() * 2) + 1; 
        if(randomDirection % 2){
            this.xVel = 1;
        }else{
            this.xVel = -1;
        }
        this.yVel = 1;
	}

	update(player:player)
	{
		console.log(this.xPos + " :x:y: " + this.yPos);

		if (this.yPos >= 500)
			this.yVel = -1;
		else if (this.yPos <= 20)
			this.yVel = 1;

        if(this.xPos <= player.xPos + player.width)
		{
            if(this.yPos >= player.yPos && this.yPos + this.height <= player.yPos + player.height)
			{
                this.xVel = 1;
            }
		}

		this.xPos += this.xVel * this.speed;
		this.yPos += this.yVel * this.speed;
	}
}

class player extends entity
{
	private speed:number = 2;
	
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

	getpos()
	{
		return [this.yPos, this.xPos];
	}
}

const game = new Game();
requestAnimationFrame(() => Game.gameLoop(game));