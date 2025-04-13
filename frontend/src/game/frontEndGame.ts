// @ts-ignore
import socket from '../utils/socket.js';
import { startSlimeEffect } from '../effects/slimeEffect.js';	
import { Logger, LogLevel } from '../utils/logger.js';
import { TURN_URL, TURN_USER, TURN_PASS, EXT_IP, STUN_URL} from '../config/env-config.js';

const log = new Logger(LogLevel.WARN);

enum KeyBindings{
	UP = 'KeyW',
    DOWN = 'KeyS'
}

export class frontEndGame {
	private static keysPressed: { [key: string]: boolean } = {};
	private gameCanvas : HTMLCanvasElement;
	private container : HTMLElement;
	private ctx : CanvasRenderingContext2D;
	private color : string;
	private player1Score : number = 0;
	private player2Score : number = 0;
	private player1PosY : number = 0;
	private player2PosY : number = 0;
	private ballY : number;
	private ballX : number;
	private ballSize : number;

	private dataChannel: RTCDataChannel | null = null;

	private configuration: RTCConfiguration;

    private peerConnection: RTCPeerConnection | null = null;

    // Add a property to store candidates that arrive before remote description
    private bufferedCandidates: RTCIceCandidateInit[] = [];

	constructor() {
		this.container = document.getElementById("game-container");
		this.setupButtons();

		const ip = this.getExternalIP();
		if (ip) {
			log.info("Your external IP is:", ip);
		} else {
			log.warn("Could not get external IP.");
		}

		this.configuration = {
			iceServers: [
				{
					urls: TURN_URL,
					username: TURN_USER,
					credential: TURN_PASS
				},
				{
					urls: STUN_URL
				}
			]
		};
		
		log.info("ICE config loaded:");
		log.info(this.configuration);
		this.peerConnection = new RTCPeerConnection(this.configuration);
		log.info("Peer connection created");
		this.setupPeerConnectionEvents();
		

		socket.on('offer', async (offer) => {
			try {
                if (!this.peerConnection) {
                    this.peerConnection = new RTCPeerConnection(this.configuration);
                    log.info("Peer connection created");
                    this.setupPeerConnectionEvents();
                // Critical on LINUX!
                } else if (this.peerConnection.signalingState !== 'stable') {
                    log.warn("Frontend: Signaling state not stable, skipping offer");
                    return;
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

	//private async loadIceConfig(): Promise<RTCConfiguration> {
	//	const response = await fetch('/webrtc-config');
	//	const data = await response.json();
	//	return { iceServers: data.iceServers };
	//}

	private async getExternalIP(): Promise<string | null> {
		try {
			log.info("Fetching external IP");
			const res = await fetch('/api/external-ip');
			const data = await res.json();
			return data.ip;
		} catch (err) {
			log.error("Failed to fetch external IP:", err);
			return null;
		}
	}

	createCanvas()
	{
		this.gameCanvas = document.createElement("canvas");
		this.container.appendChild(this.gameCanvas);
		this.ctx = this.gameCanvas.getContext("2d")!;
		this.gameCanvas.width = 800;
		this.gameCanvas.height = 600;
	}

	setupButtons()
	{
		const testbtn = document.getElementById("test-btn");
		
		testbtn.addEventListener("click", () => {
			socket.emit("joinRoomQue");
		});

	}

	setupPeerConnectionEvents() {
		log.info("Setting up peer connection events");
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
				log.debug("Raw message from backend:", e.data);
				try {
					const data = JSON.parse(e.data);
					if (!data.type) {
						throw new Error("Missing type field in message");
					}
					if (data.type === 'gameState') {
						this.updateGameState(data.positions, data.scores);
						// log.debug("Game state updated");
					} else {
						throw new Error(`Unhandled message type: ${data.type}`);
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
		log.info("Setting up key listeners");
		document.addEventListener('keydown', (e) => {
			if (e.code === KeyBindings.UP || e.code === KeyBindings.DOWN) {
				const data = { key: e.code, isPressed: true };
				log.debug("Sending key down event:", JSON.stringify(data));
				if (dataChannel.readyState === 'open') {
					dataChannel.send(JSON.stringify(data));
				} else {
					log.warn("DataChannel not open, cannot send:", data);
				}
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

	updateGameState(positions, scores) {
		this.player1Score = scores[0];
		this.player2Score = scores[1];

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
			this.ctx.fillStyle = "white";
			this.ctx.fillRect(this.gameCanvas.width / 2 - 10, i + 5, 15, 20);
		}
		this.ctx.font = "48px 'Comic Sans MS', cursive, sans-serif";
		this.ctx.fillText(this.player2Score.toString(), this.gameCanvas.width / 2 - 48 * 2, 50);
		this.ctx.fillText(this.player1Score.toString(), this.gameCanvas.width / 2 + 48, 50);
		this.ctx.fillStyle = this.color;
		this.ctx.fillRect(this.ballX, this.ballY, this.ballSize, this.ballSize);
		this.ctx.fillRect(10, this.player1PosY, 10, 50);
		this.ctx.fillRect(780, this.player2PosY, 10, 50);
	}

	settings(settings, color)
	{
		this.color = color;
		const {ballSettings, playerSettings} = settings;
		this.ballSize = ballSettings.ballSize;
	}
}

socket.on("connect", () => {
	log.info("Connected to server");
});

let game : frontEndGame;

export function createNewGame()
{
	game = new frontEndGame();
}

socket.on("playerJoined", (playerAmount) => {
	const sizeTxt = document.getElementById("size-txt");

	sizeTxt.textContent = "Lobby size: " + playerAmount + "/2";
});

socket.on("roomFull", () => {
	const strtBtn = document.getElementById("start-btn");
	const gameEdit = document.getElementById("edit-game");

	const ballSize  = (document.getElementById("ball-size") as HTMLInputElement)
	const ballSpeed = (document.getElementById("ball-speed") as HTMLInputElement)

	strtBtn.classList.remove("bg-red-500");
    strtBtn.classList.add("bg-green-500");

	strtBtn.hidden = false

	gameEdit.hidden = false;

	strtBtn.addEventListener("click", () => {
		const ballSizeValue = ballSize.value.trim() === "" ? ballSize.placeholder : ballSize.value;
		const ballSpeedValue = ballSpeed.value.trim() === "" ? ballSpeed.placeholder : ballSpeed.value;

		socket.emit("hostStart", {
			ballSettings: {
				ballSize: ballSizeValue,
				ballSpeed: ballSpeedValue
			},
			playerSettings: {

			}
		});
	});
})

socket.on("startGame", (roomId : string, settings) => {
	const select = document.getElementById("colorSelect") as HTMLSelectElement;
	const color = select.options[select.selectedIndex].value;

	const winnerElement = document.getElementById("winner-text");
    if (winnerElement) {
        winnerElement.remove();
    }

	document.getElementById("gameroom-page").hidden = true;
	log.info("Game started in room:", roomId);
	game.createCanvas();
	game.settings(settings, color);
	//game.updateGraphics();
});

socket.on("gameOver", (winner : number) => {
	document.getElementById("gameroom-page").hidden = false;
	var winnerElement = document.createElement("span");
	winnerElement.id = "winner-text";
	winnerElement.textContent = "Winner: " + winner;
	const container = document.getElementById("game-container");

	var canvas = container.querySelector("canvas");

	canvas.remove();

	container.prepend(winnerElement);

	startSlimeEffect();
});