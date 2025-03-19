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
	public player2PosY : number = 30; // change public to private later
	public ballY : number;
	public ballX : number;


    private peerConnection: RTCPeerConnection | null = null;

	//private dataChannel = new RTCDataChannel();

	private configuration: RTCConfiguration;


	constructor()
	{
		this.configuration = {
			iceServers: [
				{
					urls: 'stun:stun.l.google.com:19302',
				}//,
				//// Optional TURN server (can be added later if needed)
				//{
					//    urls: 'turn:your-turn-server.example.com', // TURN server URL
					//    username: 'username', // Optional TURN credentials
					//    credential: 'password', // Optional TURN credentials
					//},
				],
			};


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
        
		//this.peerConnection.onicecandidate = ({ candidate }) => {

		//	if (candidate) {
		
		//		socket.emit('ice-candidate', candidate);
		
		//	}
		
		//};
		
		socket.on('ice-candidate', async (candidate) => {
			console.log("Received ice candidate");
			this.peerConnection.addIceCandidate(candidate);
		
		})

		socket.on('offer', async (offer) => {
			if (!this.peerConnection) { 
				this.peerConnection = new RTCPeerConnection(this.configuration);
			}

			this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
		
			this.peerConnection.createAnswer()
		
				.then(answer => {
		
					this.peerConnection.setLocalDescription(answer);
		
					socket.emit('answer', answer);
		
				});
		
		});
		
		socket.on('answer', async (answer) => {
			await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));		  
		});

	}

	createOffer() {

		this.peerConnection = new RTCPeerConnection(this.configuration);

		this.peerConnection.createOffer()
	
			.then(offer => {
	
				this.peerConnection.setLocalDescription(offer);
	
				socket.emit('offer', offer);
	
			});
	
	}


	//public sendGameData(): void {
    //    if (this.dataChannel && this.dataChannel.readyState === 'open') {
    //        // Send player positions or any game-related data
    //        const gameData = {
    //            player1PosY: this.player1PosY,
    //            player2PosY: this.player2PosY,
    //            ballX: this.ballX,
    //            ballY: this.ballY
    //        };
    //        this.dataChannel.send(JSON.stringify(gameData));
    //    }
    //}

	updateGraphics() 
	{
		this.ctx.fillStyle = "#000";
		this.ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
		for (var i = 0; i <= this.gameCanvas.height; i += 30) {
			this.ctx.fillStyle = "red";
			this.ctx.fillRect(this.gameCanvas.width / 2 - 10, i + 5, 15, 20);
		}
		this.ctx.fillStyle = "red";
		this.ctx.fillRect(this.ballX, this.ballY, 20, 20);
		this.ctx.fillRect(20, this.player1PosY, 10, 50);
		this.ctx.fillRect(780, this.player2PosY, 10, 50);
		//Game.testnum
	}

	//keyDown()
	//{
	//	document.addEventListener('keydown', (e) => 
	//	{
	//		keyBind.keysPressed[e.code] = true;
	//		socket.emit('keysPressed', keyBind.keysPressed)
	//	});

	//	document.addEventListener('keyup', (e) => 
	//	{
	//		keyBind.keysPressed[e.code] = false;
	//		socket.emit('keysPressed', keyBind.keysPressed);
	//	});
	//}
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

socket.on("startGame", (roomId : string, host : string) => {
	console.log("Game started");
	keybind.updateGraphics();
	if (socket.id === host)
		keybind.createOffer();
});

//socket.on("updateGame", (posList : number[]) => {
//	console.log("Game updated");
//	keybind.player1PosY = posList[0][0];
//	keybind.player2PosY = posList[1][0];
//	keybind.ballY = posList[2][0];
//	keybind.ballX = posList[2][1];
//	console.log(posList);
//	keybind.updateGraphics();
//});