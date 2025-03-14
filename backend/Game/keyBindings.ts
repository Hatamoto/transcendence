const socket = io();

enum KeyBindings{
UP = 'KeyW',
    DOWN = 'KeyS'
}

class keyBind {
	private static keysPressed: { [key: string]: boolean } = {};
	private testbtn : HTMLElement;
	private gameCanvas : HTMLCanvasElement;
	private ctx : CanvasRenderingContext2D;
	public player1PosY : number = 30;
	public player2PosY : number = 30;


	constructor()
	{
		this.gameCanvas = document.createElement("canvas");
		document.body.appendChild(this.gameCanvas);
		this.ctx = this.gameCanvas.getContext("2d")!;
		this.gameCanvas.width = 800;
		this.gameCanvas.height = 600;

		this.testbtn = document.getElementById("test-btn");
		this.testbtn.addEventListener("click", () => {
			const room : number = 1;
			socket.emit("joinRoom", room);
		});
	}

	updateGraphics() 
	{
		this.ctx.fillStyle = "#000";
		this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
		for (var i = 0; i <= this.gameCanvas.height; i += 30) {
			this.ctx.fillStyle = "red";
			this.ctx.fillRect(this.gameCanvas.width / 2 - 10, i + 5, 15, 20);
		}
		this.ctx.fillStyle = "red";
		this.ctx.fillRect(20, this.player1PosY, 10, 50);
		this.ctx.fillRect(580, this.player2PosY, 10, 50);
		//Game.testnum
	}

	keyDown()
	{
		document.addEventListener('keydown', (e) => 
		{
			keyBind.keysPressed[e.code] = true;
			socket.emit('keysPressed', keyBind.keysPressed)
		});

		document.addEventListener('keyup', (e) => 
		{
			keyBind.keysPressed[e.code] = false;
			socket.emit('keysPressed', keyBind.keysPressed);
		});
	}
	//static loop()
	//{
	//	console.log("Working");
	//	socket.emit('keysPressed', keyBind.keysPressed);
	//	requestAnimationFrame(() => keyBind.loop());
	//}
}

socket.on("connect", () => {
	console.log("Connected to server");
});

const keybind = new keyBind();

socket.on("startGame", () => {
	console.log("Game started");
	keybind.updateGraphics();
	keybind.keyDown();
});

socket.on("updateGame", (playerPos : number[]) => {
	console.log("Game updated");
	keybind.player1PosY = playerPos[0];
	keybind.player2PosY = playerPos[1];
	console.log(playerPos);
	keybind.updateGraphics();
});