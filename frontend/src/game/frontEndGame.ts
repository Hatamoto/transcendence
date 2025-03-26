const socket = io();
import { Logger, LogLevel } from '../utils/logger.js';

const log = new Logger(LogLevel.INFO);

log.info("UI ready")

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

	private dataChannel: RTCDataChannel | null = null;

	private configuration: RTCConfiguration;

    private peerConnection: RTCPeerConnection | null = null;

    // Add a property to store candidates that arrive before remote description
    private bufferedCandidates: RTCIceCandidateInit[] = [];

	constructor() {

		this.gameCanvas = document.createElement("canvas");
		document.body.appendChild(this.gameCanvas);
		this.ctx = this.gameCanvas.getContext("2d")!;
		this.gameCanvas.width = 800;
		this.gameCanvas.height = 600;

		this.testbtn = document.getElementById("test-btn");
		this.testbtn.addEventListener("click", () => {
			socket.emit("joinRoomQue");
		});
        
		this.loadIceConfig().then(config => {
			this.configuration = config;
			this.peerConnection = new RTCPeerConnection(this.configuration);
			log.info("Peer connection created");
			this.setupPeerConnectionEvents();
		});

		socket.on('offer', async (offer) => {
			try {
				if (!this.peerConnection) {
					const config = await this.loadIceConfig();
					this.configuration = config;
					this.peerConnection = new RTCPeerConnection(this.configuration);
					log.info("Peer connection created");
					this.setupPeerConnectionEvents();
				}
				
				log.info("Frontend received offer");
				log.debug(offer);
				await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
				
				const answer = await this.peerConnection.createAnswer();
				await this.peerConnection.setLocalDescription(answer);
				socket.emit('answer', answer);
				log.info("Frontend sent answer.");
				log.debug(this.peerConnection.localDescription);
				if (this.bufferedCandidates && this.bufferedCandidates.length > 0) {
					log.info("Processing buffered ICE candidates");
					for (const candidate of this.bufferedCandidates) {
						await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
					}
					this.bufferedCandidates = [];
				}
			} catch (e) {
				log.error("Error handling offer:", e);
			}
		});
		
		socket.on('answer', async (answer) => {
			await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));		  
		});

		socket.on('ice-candidate', async (candidate) => {
			if (!this.peerConnection) {
				log.warn("Received ICE candidate but peer connection not created yet");
				return;
			}
			
			try {
				// Buffer ICE candidates until remote description is set
				if (!this.peerConnection.remoteDescription) {
					log.info("Buffering ICE candidate until remote description is set");
					this.bufferedCandidates = this.bufferedCandidates || [];
					this.bufferedCandidates.push(candidate);
				} else {
					// Add ICE candidate if remote description is already set
					await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
					log.info("Added ICE candidate successfully");
				}
			} catch (e) {
				log.error("Error adding received ICE candidate", e);
			}
		});
	}

	private async loadIceConfig(): Promise<RTCConfiguration> {
		const response = await fetch('/webrtc-config');
		const data = await response.json();
		return { iceServers: data.iceServers };
	}

	setupPeerConnectionEvents() {
		// Send ICE candidates to backend explicitly
		this.peerConnection.onicecandidate = event => {
			if (event.candidate) {
				log.info("ICE candidate generated");
				log.debug(event.candidate);
				socket.emit('ice-candidate', event.candidate);
			} else {
				log.info("ICE candidate gathering complete");
			}
		};
			
		// Handle incoming data channel from server
		this.peerConnection.ondatachannel = (event) => {
			log.info("Received data channel from server");
			this.dataChannel = event.channel;
			  
			this.dataChannel.onopen = () => {
				log.info("Data channel explicitly OPENED");
				this.setupKeyListeners(this.dataChannel);
			};
			  
			this.dataChannel.onclose = () => log.info("Data channel closed");
			this.dataChannel.onerror = (e) => log.error("Data channel error:", e);
			  
			this.dataChannel.onmessage = (e) => {
				log.debug("Message received from backend:", e.data);
				try {
					const data = JSON.parse(e.data);
					if (data.type === 'gameState') {
						this.updateGameState(data.positions);
						log.debug(" Game state updated");
					}
				} catch (err) {
					log.error("Error handling data channel message:", err);
				}
			};
		};
			
		this.peerConnection.onconnectionstatechange = () => {
			log.debug("Connection state:", this.peerConnection.connectionState);
		};
	
		this.peerConnection.oniceconnectionstatechange = () => {
			log.debug("ICE connection state:", this.peerConnection.iceConnectionState);
		};
	}	

	setupKeyListeners(dataChannel) {
		document.addEventListener('keydown', (e) => {
			if (e.code === KeyBindings.UP || e.code === KeyBindings.DOWN) {
				const data = { key: e.code, isPressed: true };
				log.debug("Sending key down event:", data);
				dataChannel.send(JSON.stringify(data));
			}
		});
		
		document.addEventListener('keyup', (e) => {
			if (e.code === KeyBindings.UP || e.code === KeyBindings.DOWN) {
				const data = { key: e.code, isPressed: false };
				log.debug("Sending key up event:", data);
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
	log.info("Connected to server");
});

let game;

export function createNewGame()
{
	game = new frontEndGame();
}

socket.on("startGame", (roomId : string) => {
	log.info("Game started in room:", roomId);
	game.updateGraphics();
});
