const socket = io();

enum KeyBindings{
UP = 'KeyW',
    DOWN = 'KeyS'
}

class keyBind {
	private static keysPressed: { [key: string]: boolean } = {};
	private testbtn : HTMLElement;

	constructor()
	{
		this.testbtn = document.getElementById("test-btn");
		this.testbtn.addEventListener("click", () => {
			const room : number = 1;
			socket.emit("joinRoom", room);
		});
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
	new keyBind();
	//requestAnimationFrame(() => keyBind.loop());
});