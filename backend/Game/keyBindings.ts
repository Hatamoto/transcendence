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

	private dataChannel: RTCDataChannel | null = null;

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
        
		socket.on('offer', async (offer) => {
			if (!this.peerConnection) { 
				this.peerConnection = new RTCPeerConnection(this.configuration);
				this.setupPeerConnectionEvents();
			}

			try {
				await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
				const answer = await this.peerConnection.createAnswer();
				await this.peerConnection.setLocalDescription(answer);
				socket.emit('answer', answer);
			} catch (e) {
				console.error("Error handling offer:", e);
			}
		});
		
		socket.on('answer', async (answer) => {
			console.log("Received answer:", answer);
			await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));		  
		});

		socket.on('ice-candidate', async (candidate) => {
			console.log("Received ICE candidate:", candidate);
			if (this.peerConnection) {
				try {
					await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
				} catch (e) {
					console.error("Error adding received ICE candidate", e);
				}
			}
		});
	}

	createOffer() {

		this.peerConnection = new RTCPeerConnection(this.configuration);
		this.setupPeerConnectionEvents();

		this.peerConnection.createOffer()
	
			.then(offer => {
	
				this.peerConnection.setLocalDescription(offer);
	
				socket.emit('offer', offer);
	
			})
			.catch(e => console.error("Error creating offer:", e));
	
	}

	setupPeerConnectionEvents()
	{
		this.dataChannel = this.peerConnection.createDataChannel('gameData');
		
		this.dataChannel.onopen = () => {
			console.log("Data channel opened");
			this.setupKeyListeners(this.dataChannel);
		};
		
		this.dataChannel.onclose = () => console.log("Data channel closed");
		this.dataChannel.onerror = (e) => console.error("Data channel error:", e);

		this.peerConnection.onicecandidate = ({ candidate }) => {
			if (candidate) {
				console.log("Generated ICE candidate:", candidate);
				socket.emit('ice-candidate', candidate);
			}
		};
		
		this.peerConnection.onconnectionstatechange = () => {
			console.log("Connection state:", this.peerConnection.connectionState);
		};
		
		this.peerConnection.oniceconnectionstatechange = () => {
			console.log("ICE connection state:", this.peerConnection.iceConnectionState);
		};
	}

	setupKeyListeners(dataChannel) {
		document.addEventListener('keydown', (e) => {
			if (e.code === KeyBindings.UP || e.code === KeyBindings.DOWN) {
				const data = { key: e.code, isPressed: true };
				dataChannel.send(JSON.stringify(data));
			}
		});
		
		document.addEventListener('keyup', (e) => {
			if (e.code === KeyBindings.UP || e.code === KeyBindings.DOWN) {
				const data = { key: e.code, isPressed: false };
				dataChannel.send(JSON.stringify(data));
			}
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
		this.ctx.fillRect(this.ballX, this.ballY, 20, 20);
		this.ctx.fillRect(20, this.player1PosY, 10, 50);
		this.ctx.fillRect(780, this.player2PosY, 10, 50);
		//Game.testnum
	}
}

socket.on("connect", () => {
	console.log("Connected to server");
});

const keybind = new keyBind();

socket.on("startGame", (roomId : string, host : string) => {
	console.log("Game started");
	keybind.updateGraphics();
	if (socket.id === host)
	{
		keybind.createOffer();
	}
});
