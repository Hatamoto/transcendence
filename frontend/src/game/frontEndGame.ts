// @ts-ignore
import { Logger, LogLevel } from '../utils/logger.js';
import { TURN_URL, TURN_USER, TURN_PASS, EXT_IP, STUN_URL} from '../config/env-config.js';
import { setupButtons  } from './matchmaking.js';
import { router } from '../App';

const log = new Logger(LogLevel.INFO);

log.info("UI ready")

class Entity {
	protected yVel: number;
	protected xVel: number;
	protected height: number;
	protected width: number;
	protected yPos: number;
	protected xPos: number;
	protected speed: number;

	constructor(h, w, y, x) {
		this.yVel = 0;
		this.xVel = 0;
		this.height = h;
		this.width = w;
		this.yPos = y;
		this.xPos = x;
	}

	draw(ctx) {
		ctx.fillStyle = "red";
		ctx.fillRect(this.xPos, this.yPos, this.width, this.height);
	}

	getpos() {
		return [this.yPos, this.xPos];
	}
}

class Ball extends Entity {
	constructor(h, w, y, x) {
		super(h, w, y, x);
		this.speed = 5;

		this.xVel = Math.random() < 0.5 ? 1 : -1;
		this.yVel = Math.random() < 0.5 ? 1 : -1;
	}

	update(player, player2, deltaTime) {
		const nextX = this.xPos + this.xVel * this.speed * deltaTime;
		const nextY = this.yPos + this.yVel * this.speed * deltaTime;

		if (nextY + this.height >= 600) this.yVel = -1;
		else if (nextY <= 0) this.yVel = 1;

		if (
			nextX <= player.xPos + player.width &&
			nextY + this.height >= player.yPos &&
			nextY <= player.yPos + player.height
		) {
			this.xVel = 1;
		}
		if (
			nextX + this.width >= player2.xPos &&
			nextY + this.height >= player2.yPos &&
			nextY <= player2.yPos + player2.height
		) {
			this.xVel = -1;
		}

		if (nextX <= 0) {
			game.setScore(1, 0);
			this.xPos = 400 - this.width / 2;
			this.yVel = Math.random() < 0.5 ? 1 : -1;
			return; // skip position update this frame
		} else if (nextX + this.width >= 800) {
			game.setScore(0, 1);
			this.xPos = 400 - this.width / 2;
			this.yVel = Math.random() < 0.5 ? 1 : -1;
			return; // skip position update this frame
		}
	
		this.xPos = nextX;
		this.yPos = nextY;
	}

	set(value)
	{
		this.height = Number(value.ballSize);
		this.width = Number(value.ballSize);
		this.speed = Number(value.ballSpeed);
	}
}

class Player extends Entity {
	constructor(h, w, y, x) {
		super(h, w, y, x);
		this.speed = 4;
	}

	setvel(velocityY) {
		this.yVel = velocityY;
	}

	move(keysPressed: { [key: string]: boolean }, deltaTime) {
		const nextY = this.yPos + this.yVel * this.speed * deltaTime;
		
		if (nextY + this.height >= 600) return;
		else if (nextY + this.yVel <= 0) return;

		this.yPos += this.yVel * this.speed * deltaTime;
	}

	setpos(value) {
		this.yPos = value;
	}
}

enum KeyBindings{
	UP = 'KeyW',
    DOWN = 'KeyS',
	SUP = 'ArrowUp',
	SDOWN = 'ArrowDown'
}

export class frontEndGame {
	private keysPressed: { [key: string]: boolean } = {};
	private gameCanvas : HTMLCanvasElement;
	private container : HTMLElement;
	private ctx : CanvasRenderingContext2D;
	private color : string;
	private player1Score : number = 0;
	private player2Score : number = 0;
	private player1 : Player | null = null;
	private player2 : Player | null = null;
	private ballY : number;
	private ballX : number;
	private ballSize : number;
	private ball: Ball | null = null;
	private lastUpdateTime: number;

	private dataChannel: RTCDataChannel | null = null;
    private peerConnection: RTCPeerConnection | null = null;
	private configuration: RTCConfiguration;

    // Add a property to store candidates that arrive before remote description
    private bufferedCandidates: RTCIceCandidateInit[] = [];

    private keyDownHandler: (e: KeyboardEvent) => void;
    private keyUpHandler: (e: KeyboardEvent) => void;

	constructor() {
		this.player1 = new Player(50, 10, 300, 10);
		this.player2 = new Player(50, 10, 300, 780);

		//const ip = this.getExternalIP();
		//if (ip) {
		//	log.info("Your external IP is:", ip);
		//} else {
		//	log.warn("Could not get external IP.");
		//}

		//log.info("EXT_IP:", EXT_IP);
		//log.info("TURN_URL:", TURN_URL);
		//log.info("TURN_USER:", TURN_USER);
		//log.info("TURN_PASS:", TURN_PASS);
		//log.info("STUN_URL:", STUN_URL);

		this.configuration = {
			iceServers: [
				{
					urls: "turn:"+EXT_IP+":3478",
					username: TURN_USER,
					credential: TURN_PASS
				},
				{
					urls: STUN_URL
				}
			]
		};
		
		//log.info("ICE config loaded:");
		//log.info(this.configuration);
		//this.peerConnection = new RTCPeerConnection(this.configuration);
		//log.info("Peer connection created");
		//this.setupPeerConnectionEvents();
	}

	//private async loadIceConfig(): Promise<RTCConfiguration> {
	//	const response = await fetch('/webrtc-config');
	//	const data = await response.json();
	//	return { iceServers: data.iceServers };
	//}

	private async getExternalIP(): Promise<string | null> {
		try {
			log.info("Fetching external IP");
			const res = await fetch("127.0.0.1:5001" + '/external-ip');
			const data = await res.json();
			return data.ip;
		} catch (err) {
			log.error("Failed to fetch external IP:", err);
			return null;
		}
	}

	setScore(player1Score, player2Score) {
		this.player1Score += player1Score;
		this.player2Score += player2Score;
	}

	createCanvas()
	{
		this.container = document.getElementById("game-container");
		this.gameCanvas = document.createElement("canvas");
		this.container.appendChild(this.gameCanvas);
		this.ctx = this.gameCanvas.getContext("2d")!;
		this.gameCanvas.width = 800;
		this.gameCanvas.height = 600;
	}

	setupPeerConnectionEvents(socket) {
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
				log.debug("Message received from backend:", e.data);
				try {
					const data = JSON.parse(e.data);
					if (data.type === 'gameState') {
						this.updateGameState(data.positions, data.scores);
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

	cleanUp() {
        if (this.keyDownHandler) {
            document.removeEventListener('keydown', this.keyDownHandler);
            this.keyDownHandler = null;
        }
        
        if (this.keyUpHandler) {
            document.removeEventListener('keyup', this.keyUpHandler);
            this.keyUpHandler = null;
        }

		if (this.dataChannel) {
			this.dataChannel.close();
			this.dataChannel = null;
		}
		if (this.peerConnection) {
			this.peerConnection.close();
			this.peerConnection = null;
		}
	}

	setupKeyListeners(dataChannel) {
		log.info("Setting up key listeners");
        this.keyDownHandler = (e) => {
            if (e.code === KeyBindings.UP || e.code === KeyBindings.DOWN) {
                const data = { key: e.code, isPressed: true };
                log.debug("Sending key down event:", data);
                dataChannel.send(JSON.stringify(data));
            }
        };
        
        this.keyUpHandler = (e) => {
            if (e.code === KeyBindings.UP || e.code === KeyBindings.DOWN) {
                const data = { key: e.code, isPressed: false };
                log.debug("Sending key up event:", data);
                dataChannel.send(JSON.stringify(data));
            }
        };
        
        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
	}

	setupSoloKeyListeners() {
        this.keyDownHandler = (e) => {
            this.keysPressed[e.code] = true;
        };
        
        this.keyUpHandler = (e) => {
            this.keysPressed[e.code] = false;
        };

        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
	}

	updateGameState(positions, scores) {
		this.player1Score = scores[0];
		this.player2Score = scores[1];

		if (positions && positions.length >= 3) {
		  // Update player 1 position
		  this.player1.setpos(positions[0][0]);
		  
		  // Update player 2 position
		  this.player2.setpos(positions[1][0]);
		  
		  // Update ball position
		  this.ballY = positions[2][0];
		  this.ballX = positions[2][1];
		  
		  // Redraw the game
		  this.updateGraphics();
		}
	}

	updateSoloGameState()
	{
		const now = Date.now();
		const deltaTime = (now - this.lastUpdateTime) / 16.67; // Normalize to ~60 FPS
		this.lastUpdateTime = now;

		if (this.keysPressed[KeyBindings.UP])
			this.player1.setvel(-1);
		else if (this.keysPressed[KeyBindings.DOWN])
			this.player1.setvel(1);
		else
			this.player1.setvel(0);

		if (this.keysPressed[KeyBindings.SUP]) 
			this.player2.setvel(-1);
		else if (this.keysPressed[KeyBindings.SDOWN])
			this.player2.setvel(1);
		else
			this.player2.setvel(0);

		this.player1.move(this.keysPressed, deltaTime);
		this.player2.move(this.keysPressed, deltaTime);
		this.ball.update(this.player1, this.player2, deltaTime);
		this.updateGraphics();
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
		this.ctx.fillRect(10, this.player1.getpos()[0], 10, 50);
		this.ctx.fillRect(780, this.player2.getpos()[0], 10, 50);

		if (this.ball)
		{
			this.ball.draw(this.ctx);
		}
	}

	settings(settings, color)
	{
		this.color = color;
		const {ballSettings, playerSettings} = settings;
		this.ballSize = ballSettings.ballSize;
		this.ball = ballSettings.ball;
		this.lastUpdateTime = Date.now();
	}


	socketLogic(socket)
	{
		socket.on('offer', async (offer) => {
			try {
				if (!this.peerConnection) {
					// const config = await this.loadIceConfig();
					// this.configuration = config;
					this.peerConnection = new RTCPeerConnection(this.configuration);
					log.info("Peer connection created");
					this.setupPeerConnectionEvents(socket);
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

		socket.on("connect", () => {
			log.info("Connected to server");
			const strtBtn = document.getElementById("start-btn");
			const gameEdit = document.getElementById("edit-game");
		
			if (strtBtn)
				strtBtn.hidden = true;
			if (gameEdit)
				gameEdit.hidden = true;
		});
		
		socket.on("playerJoined", (playerAmount) => {
			const sizeTxt = document.getElementById("size-txt");
		
			sizeTxt.textContent = "Lobby size: " + playerAmount + "/2";
		});
		
		socket.on("playerDisconnected", (playerAmount) => {
			log.info("Player disconnected");
			const sizeTxt = document.getElementById("size-txt");
		
			sizeTxt.textContent = "Lobby size: " + playerAmount + "/2";
		});
		
		socket.on("roomFull", (type) => {


			if (type === "normal") {
				const strtBtn = document.getElementById("start-btn");
				const gameEdit = document.getElementById("edit-game");
			
				const ballSize  = (document.getElementById("ball-size") as HTMLInputElement)
				const ballSpeed = (document.getElementById("ball-speed") as HTMLInputElement)
			
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
			}
			else if (type === "tournament") {
				const container = document.getElementById("game-container")
				const countdownElement = document.createElement("h1");
				countdownElement.id = "countdown";
				countdownElement.textContent = "10";
				container.appendChild(countdownElement);

				let count = 10;
				const intervalId = setInterval(() => {
				  count--;
				  countdownElement.textContent = count.toString();
			
				  if (count === 0) {
					clearInterval(intervalId);
					countdownElement.remove();
				  }
				}, 1000);
			}
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

			if (this.peerConnection == null) {
				// const config = await this.loadIceConfig();
				// this.configuration = config;
				this.peerConnection = new RTCPeerConnection(this.configuration);
				log.info("Peer connection created");
				this.setupPeerConnectionEvents(socket);
			}
			game.updateGraphics();
		});
		
		socket.on("gameOver", (winner : number, type : string) => {
			if (type == "solo")
				document.getElementById("gameroom-page").hidden = false;
			var winnerElement = document.createElement("span");
			winnerElement.id = "winner-text";
			winnerElement.textContent = "Winner: " + winner;
			const container = document.getElementById("game-container");
		
			var canvas = container.querySelector("canvas");
		
			canvas.remove();
		
			container.prepend(winnerElement);
			game.cleanUp();
			if (type == "tournament")
			{
				setTimeout(() => {
					router.navigate("/tournaments");
				  }, 3000);
			}
		});
	}
}


let game : frontEndGame;
let animationFrameId: number | null = null;

export function createNewGame(matchType : string, socket, userId : string)
{
	setupButtons(socket, userId);
	game = new frontEndGame();
	if (matchType != "solo")
	{
		game.socketLogic(socket);
	}
}

export function cleanGame()
{
	if (animationFrameId != null)
		cancelAnimationFrame(animationFrameId);
	if (game)
		game.cleanUp();
	game = null;
} 

export function startSoloGame()
{
	const select = document.getElementById("colorSelect") as HTMLSelectElement;
	const color = select.options[select.selectedIndex].value;
	const ballSize  = (document.getElementById("ball-size") as HTMLInputElement)
	const ballSpeed = (document.getElementById("ball-speed") as HTMLInputElement)
	const ballSizeValue = ballSize.value.trim() === "" ? ballSize.placeholder : ballSize.value;
	const ballSpeedValue = ballSpeed.value.trim() === "" ? ballSpeed.placeholder : ballSpeed.value;

	document.getElementById("gameroom-page").hidden = true;
	game.setupSoloKeyListeners();
	game.createCanvas();
	game.settings({
		ballSettings: {
			ball: new Ball(20, 20, 400, 300),
			ballSize: ballSizeValue,
			ballSpeed: ballSpeedValue
		},
		playerSettings: {

		}
	}, color);
	function loopSolo() {
		game.updateSoloGameState();
		animationFrameId = requestAnimationFrame(loopSolo);
	}
	loopSolo();
}

