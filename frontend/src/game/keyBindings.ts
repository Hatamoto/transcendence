import { io } from "socket.io-client";

const socket = io();

enum KeyBindings{
	UP = 'KeyW',
	DOWN = 'KeyS',
}

class keyBind {
	private static keysPressed: { [key: string]: boolean } = {};
	private testbtn : HTMLElement;
	private gameCanvas : HTMLCanvasElement;
	private ctx : CanvasRenderingContext2D;
	public player1PosY : number = 30;
	public player2PosY : number = 30; // change public to private later
	public ballY : number = 0;
	public ballX : number = 0;


    private peerConnection: RTCPeerConnection | null = null;

	private dataChannel: RTCDataChannel | null = null;

	private configuration: RTCConfiguration;

	constructor() {
		// Optional TURN server (can be added later if needed)
		// {
		//   urls: 'turn:your-turn-server.example.com',
		//   username: 'username',
		//   credential: 'password'
		// }
		this.configuration = {
			iceServers: [
				{
				urls: 'stun:stun.l.google.com:19302'
				},
			],
		};

		this.gameCanvas = document.createElement("canvas");
		document.body.appendChild(this.gameCanvas);
		this.ctx = this.gameCanvas.getContext("2d")!;
		this.gameCanvas.width = 800;
		this.gameCanvas.height = 600;

		this.testbtn = document.getElementById("test-btn")!; // null check at end
		this.testbtn.addEventListener("click", () => {
			const room : number = 1;
			socket.emit("joinRoom", room);
		});
        
		socket.on('offer', async (offer: RTCSessionDescriptionInit) => {
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
		
		socket.on('answer', async (answer: RTCSessionDescriptionInit) => {
			console.log("Received answer:", answer);
			if (this.peerConnection) {
				await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
			} else { // null check
				console.error("PeerConnection is null while setting remote description");
			}		  
		});

		socket.on('ice-candidate', async (candidate: RTCIceCandidateInit | undefined) => {
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
	
				if (this.peerConnection) {
					this.peerConnection.setLocalDescription(offer);
				} else { // null check
					console.error("PeerConnection is null while setting local description");
				}
	
				socket.emit('offer', offer);
	
			})
			.catch(e => console.error("Error creating offer:", e));
	
	}

	setupPeerConnectionEvents()
	{
		if (this.peerConnection) {
			this.dataChannel = this.peerConnection.createDataChannel('gameData');
		} else {
			console.error("PeerConnection is null while creating data channel");
		}
		
		this.dataChannel && (this.dataChannel.onopen = () => {
			console.log("Data channel opened");
			this.setupKeyListeners(this.dataChannel);
		  });
		  
		this.dataChannel && (this.dataChannel.onclose = () => console.log("Data channel closed"));
		this.dataChannel && (this.dataChannel.onerror = (e) => console.error("Data channel error:", e));
		  
		if (this.peerConnection) {
			this.peerConnection.onicecandidate = ({ candidate }) => {
				if (candidate) {
				console.log("Generated ICE candidate:", candidate);
				socket.emit('ice-candidate', candidate);
				}
			};
			
			this.peerConnection.onconnectionstatechange = () =>
				console.log("Connection state:", this.peerConnection!.connectionState);
			
			this.peerConnection.oniceconnectionstatechange = () =>
				console.log("ICE connection state:", this.peerConnection!.iceConnectionState);
		} else {
		console.error("Peer connection is null");
		}
	}

	setupKeyListeners(dataChannel: RTCDataChannel | null) {
		document.addEventListener('keydown', (e) => {
			if (e.code === KeyBindings.UP || e.code === KeyBindings.DOWN) {
				const data = { key: e.code, isPressed: true };
				dataChannel?.send(JSON.stringify(data)); // skip if null dont throw
			}
		});
		
		document.addEventListener('keyup', (e) => {
			if (e.code === KeyBindings.UP || e.code === KeyBindings.DOWN) {
				const data = { key: e.code, isPressed: false };
				dataChannel?.send(JSON.stringify(data));
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
