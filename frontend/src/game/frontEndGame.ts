// import { io } from 'socket.io-client';
const socket = io();
import { Logger, LogLevel } from '../utils/logger.js';

const log = new Logger(LogLevel.INFO);

log.info("[FRONTEND] UI ready")

enum KeyBindings{
	UP = 'KeyW',
    DOWN = 'KeyS'
}

export class frontEndGame {
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

    // Add a property to store candidates that arrive before remote description
    private bufferedCandidates: RTCIceCandidateInit[] = [];

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
			console.log("asddasd");
			socket.emit("joinRoomQue");
		});
		//this.testbtn.addEventListener("click", () => {
		//	const room : number = 1;
		//	socket.emit("joinRoom", room);
		//});
        
		socket.on('offer', async (offer) => {
			if (!this.peerConnection) { 
				this.peerConnection = new RTCPeerConnection(this.configuration);
				this.setupPeerConnectionEvents();
			}

			try {
				console.log("Frontend received offer:", offer);
				await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
				
				const answer = await this.peerConnection.createAnswer();
				await this.peerConnection.setLocalDescription(answer);
				socket.emit('answer', answer);
				console.log("Frontend sent answer:", this.peerConnection.localDescription);
				
				if (this.bufferedCandidates && this.bufferedCandidates.length > 0) {
					console.log("Processing buffered ICE candidates");
					for (const candidate of this.bufferedCandidates) {
						await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
					}
					this.bufferedCandidates = [];
				}
			} catch (e) {
				console.error("Error handling offer:", e);
			}
		});
		
		socket.on('answer', async (answer) => {
			await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));		  
		});

		socket.on('ice-candidate', async (candidate) => {
			if (!this.peerConnection) {
				console.warn("Received ICE candidate but peer connection not created yet");
				return;
			}
			
			try {
				// Buffer ICE candidates until remote description is set
				if (!this.peerConnection.remoteDescription) {
					console.log("Buffering ICE candidate until remote description is set");
					this.bufferedCandidates = this.bufferedCandidates || [];
					this.bufferedCandidates.push(candidate);
				} else {
					// Add ICE candidate if remote description is already set
					await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
					console.log("Added ICE candidate successfully");
				}
			} catch (e) {
				console.error("Error adding received ICE candidate", e);
			}
		});
	}

	setupPeerConnectionEvents() {
		// Send ICE candidates to backend explicitly
		this.peerConnection.onicecandidate = event => {
			if (event.candidate) {
				console.log("[FRONTEND] ICE candidate generated:", event.candidate);
				socket.emit('ice-candidate', event.candidate);
			} else {
				console.log("[FRONTEND] ICE candidate gathering complete");
			}
		};
			
		// Handle incoming data channel from server
		this.peerConnection.ondatachannel = (event) => {
			console.log("Received data channel from server");
			this.dataChannel = event.channel;
			  
			this.dataChannel.onopen = () => {
				console.log("[FRONTEND] Data channel explicitly OPENED");
				this.setupKeyListeners(this.dataChannel);
			};
			  
			this.dataChannel.onclose = () => console.log("[FRONTEND] Data channel closed");
			this.dataChannel.onerror = (e) => console.error("[FRONTEND] Data channel error:", e);
			  
			this.dataChannel.onmessage = (e) => {
				console.log("[FRONTEND] Message received from backend:", e.data);
				try {
					const data = JSON.parse(e.data);
					if (data.type === 'gameState') {
						this.updateGameState(data.positions);
						console.log("[FRONTEND] Game state updated");
					}
				} catch (err) {
					console.error("[FRONTEND] Error handling data channel message:", err);
				}
			};
		};
			
		this.peerConnection.onconnectionstatechange = () => {
			console.log("[FRONTEND] Connection state:", this.peerConnection.connectionState);
		};
	
		this.peerConnection.oniceconnectionstatechange = () => {
			console.log("[FRONTEND] ICE connection state:", this.peerConnection.iceConnectionState);
		};
	}	

	setupKeyListeners(dataChannel) {
		document.addEventListener('keydown', (e) => {
			if (e.code === KeyBindings.UP || e.code === KeyBindings.DOWN) {
				const data = { key: e.code, isPressed: true };
				console.log("[FRONTEND] Sending key down event:", data);
				dataChannel.send(JSON.stringify(data));
			}
		});
		
		document.addEventListener('keyup', (e) => {
			if (e.code === KeyBindings.UP || e.code === KeyBindings.DOWN) {
				const data = { key: e.code, isPressed: false };
				console.log("[FRONTEND] Sending key up event:", data);
				dataChannel.send(JSON.stringify(data));
			}
		});
	}

	updateGameState(positions) {
		if (positions && positions.length >= 3) {
		  // Update player 1 position
		  this.player1PosY = positions[0][0];
		  
		  // Update player 2 position
		  this.player2PosY = positions[1][0];
		  
		  // Update ball position
		  this.ballY = positions[2][0];
		  this.ballX = positions[2][1];
		  
		  // Redraw the game
		  this.updateGraphics();
		}
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

let game;

export function createNewGame()
{
	game = new frontEndGame();
}

socket.on("startGame", (roomId : string) => {
	console.log("Game started in room:", roomId);
	game.updateGraphics();
});
