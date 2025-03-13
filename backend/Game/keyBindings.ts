const socket = io();

enum KeyBindings{
UP = 'KeyW',
    DOWN = 'KeyS'
}

class keyBind {
	private static keysPressed: { [key: string]: boolean } = {};


	constructor()
	{
		document.addEventListener('keydown', (e) => 
		{
			keyBind.keysPressed[e.code] = true;
		});

		document.addEventListener('keyup', (e) => 
		{
			keyBind.keysPressed[e.code] = false;
		});
	}

	static loop()
	{
		console.log("Working");
		socket.emit('keysPressed', keyBind.keysPressed);
		requestAnimationFrame(() => keyBind.loop());
	}
}

socket.on("connect", () => {
	console.log("Connected to server");
	new keyBind();
	requestAnimationFrame(() => keyBind.loop());
});