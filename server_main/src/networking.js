import { Server } from "socket.io";
import wrtc from "wrtc";
import { Game } from './game/game.js';
import { Logger, LogLevel } from './utils/logger.js';
import { startChat } from "./chat.js";

const log = new Logger(LogLevel.DEBUG);

global.RTCPeerConnection = wrtc.RTCPeerConnection;
global.RTCSessionDescription = wrtc.RTCSessionDescription;
global.RTCIceCandidate = wrtc.RTCIceCandidate;

// Alloactes ids whenever they are freed
class IDAllocator {
    constructor(maxID) {
        this.maxID = maxID;
        this.openRooms = new Set();
		this.freeIDs = new Set();
		for (let i = 1; i <= maxID; i++) {
			this.freeIDs.add(i);
		}
    }

    allocate() {
		if (this.openRooms.size > 0) {
			return (this.openRooms.values().next().value);
    	}
		else if (this.freeIDs.size > 0) {
			const value = Math.min(...this.freeIDs);
			this.freeIDs.delete(value);
			return (value);
		}
		else 
			return (-1);
	}

    freeRoom(id) {
		this.freeIDs.add(Number(id));
		if (this.openRooms.has(id))
			this.openRooms.delete(id);
    }

	openRoomDoors(id) {
		this.openRooms.add(id);
	}

	closeRoomDoors(id) {
		this.openRooms.delete(id);
	}
}

let io;
const games = {};
const rooms = {};
const roomIds = new IDAllocator(50);

export function setupNetworking(server){
	log.debug('Checking WebRTC globals:');
	log.debug('RTCPeerConnection:', typeof global.RTCPeerConnection !== 'undefined');
	log.debug('RTCSessionDescription:', typeof global.RTCSessionDescription !== 'undefined');
	log.debug('RTCIceCandidate:', typeof global.RTCIceCandidate !== 'undefined');


	io = new Server(server, {
		cors: {
		origin: "*", // Change to frontend URL whenever needed
		methods: ["GET", "POST"],
		allowedHeaders: ["Content-Type"],
		credentials: true
		},
	});

	io.on("connection", (socket) => { 
		startChat(io, socket);
		log.info("A user connected:", socket.id);

		socket.on('frontend-log', (logdata) => {
			const logLevel = logdata.level?.toUpperCase?.() ?? "DEBUG";
			const method = log[logLevel.toLowerCase()] || logger.debug;
			method.call(log, ...logdata.args, { __frontend: true });
		});

		socket.on("disconnect", () => {
		log.info("User disconnected:", socket.id);

		// Clean up rooms and connections when a player disconnects
		for (const roomId in rooms) {
			if (rooms[roomId].players[socket.id]) {
				delete rooms[roomId].players[socket.id];
				log.info(`Player ${socket.id} removed from room ${roomId}`);
				
				socket.to(roomId).emit("playerDisconnected", socket.id);
				
				// deleting room when its empty
				if (Object.keys(rooms[roomId].players).length === 0) {
					delete rooms[roomId];
					if (games[roomId]) {
						games[roomId].stop();
						delete games[roomId];
					}
					roomIds.freeRoom(roomId);
					log.info(`Room ${roomId} deleted`);
				}
			}
		}
		});

		socket.on('ice-candidate', (candidate) => {
			log.info(`Received ICE candidate from frontend socket ${socket.id}`);
			log.debug('Candidate:', candidate);
			const playerRoom = [...socket.rooms][1];
			if (playerRoom) {
				const peerConnection = rooms[playerRoom].players[socket.id].peerConnection;
				if (peerConnection) {
					peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
						.then(() => log.info(`ICE candidate added for ${socket.id}`))
						.catch(err => log.error(`Error adding ICE candidate for ${socket.id}:`, err));
				} else {
					log.warn(`No peerConnection found for socket ${socket.id}`);
				}
			} else {
				log.warn(`No player room found for socket ${socket.id}`);
			}
		});

		socket.on("joinRoomQue", () => {
			const roomId = roomIds.allocate();
			if (roomId == -1 || socket.rooms.size > 1)
				return ;
			if (!rooms[roomId]) {
				roomIds.openRoomDoors(roomId);
				rooms[roomId] = {
				players: {},
				gameStarted: false,
				hostId: null
				};
			}
			else
				roomIds.closeRoomDoors(roomId);
			joinRoom(roomId, socket);
		});

		socket.on('hostStart', (settings) => {
			const playerRoom = [...socket.rooms][1];
			if (!playerRoom || !rooms[playerRoom]) {
				log.warn(`Player room not found for socket ${socket.id}`);
				return;
			}
			if (Object.keys(rooms[playerRoom].players).length === 2 && !rooms[playerRoom].gameStarted) {
				
				resetRoomConnections(playerRoom);

				const playerIds = Object.keys(rooms[playerRoom].players);
				rooms[playerRoom].gameStarted = true;

				games[playerRoom] = new Game(playerIds[0], playerIds[1]);
				games[playerRoom].settings(settings);		
				initializeWebRTC(playerRoom);
				io.to(playerRoom).emit("startGame", playerRoom, settings);
			}
		});

		socket.on('answer', (answer) => {
		log.info(`Backend received answer from ${socket.id}:`);
		log.debug('Answer:', answer);
		const playerRoom = [...socket.rooms][1];

		if (playerRoom) {
			const peerConnection = rooms[playerRoom].players[socket.id].peerConnection;
			if (peerConnection) {
				log.info(`Setting remote description for socket ${socket.id} in room ${playerRoom}`);
				// Critical - LINUX
				// if (peerConnection.signalingState !== 'have-local-offer') {
				// 	log.warn(`Invalid signalingState (${peerConnection.signalingState}), skipping setRemoteDescription`);
				// 	return;
				// }
				peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
					.then(() => {
						log.info(`Remote description successfully set for socket ${socket.id}`);
		
						// Process buffered ICE candidates if they exist
						const bufferedCandidates = rooms[playerRoom].players[socket.id].bufferedCandidates || [];
						if (bufferedCandidates.length > 0) {
							log.info(`Found ${bufferedCandidates.length} buffered ICE candidates for socket ${socket.id}`);
		
							bufferedCandidates.forEach((candidate, index) => {
								log.info(`Adding buffered ICE candidate #${index + 1} for socket ${socket.id}:`, candidate);
								peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
									.then(() => log.info(`Successfully added buffered candidate #${index + 1} for socket ${socket.id}`))
									.catch(err => log.error(`Failed adding buffered candidate #${index + 1} for socket ${socket.id}:`, err));
							});
							log.info(`All buffered ICE candidates added for socket ${socket.id}`);
							log.info(`Buffered ICE candidates for socket ${socket.id}:`, bufferedCandidates);
							log.info(`Peer connection state for socket ${socket.id}:`, peerConnection.iceConnectionState);
		
							// Clear buffer
							rooms[playerRoom].players[socket.id].bufferedCandidates = [];
						} else {
							log.info(`No buffered ICE candidates found for socket ${socket.id}`);
						}
					})
					.catch(err => log.error(`Failed setting remote description for socket ${socket.id}:`, err));
			} else {
				log.warn(`Peer connection not found for socket ${socket.id} in room ${playerRoom}`);
			}
		} else {
			log.warn(`Player room not found for socket ${socket.id}`);
		}
		});
	});
}

function initializeWebRTC(roomId) {

	const room = rooms[roomId];
	if (!room || Object.keys(room.players).length < 2) return;
	const playerIds = Object.keys(room.players);
	
	if (playerIds.some(id => room.players[id].peerConnection)) {
		log.info(`WebRTC already initialized for room ${roomId}, skipping`);
		startGameLoop(roomId);
		return;
	}

	log.info(`Initializing WebRTC connections for room ${roomId} with players:`, playerIds);
	
	log.debug("TURN server:", process.env.TURN_URL);
	log.debug("TURN server credentials:", process.env.TURN_USER, process.env.TURN_PASS);
	log.debug("STUN server:", process.env.STUN_URL);

	const configuration = {
		iceServers: [
		{
			urls: process.env.TURN_URL,
			username: process.env.TURN_USER,
			credential: process.env.TURN_PASS
		},
		{
			urls: process.env.STUN_URL
		}
		]
	};

	log.info("ICE config loaded:");
	log.info(configuration);

	// Create separate connections for each player
	for (const playerId of playerIds) {
		const peerConnection = new RTCPeerConnection({ configuration });
		peerConnection.onnegotiationneeded = () => {
			log.debug("Negotiation needed event fired — this might be unexpected");
		};
		
		const dataChannel = peerConnection.createDataChannel("gameData");
	
		// ADD THIS LINE CLEARLY:
		room.players[playerId].dataChannel = dataChannel;
	
		dataChannel.onopen = () => {
			log.info(`Data channel open for player ${playerId}, readyState: ${dataChannel.readyState}`);
			room.players[playerId].dataChannel = dataChannel;
			log.info(`Peer connection state for player ${playerId}:`, peerConnection.iceConnectionState);	
	
			if (Object.values(room.players).every(player => 
				player.dataChannel && player.dataChannel.readyState === 'open')) {
				log.info("All connections established, starting game loop");
				startGameLoop(roomId);
			}
		};
	
	dataChannel.onclose = () => log.info(`Data channel closed for player ${playerId}`);
	
	dataChannel.onmessage = (event) => {
		// log.debug("Received data channel message:", event.data);
		try {
			const data = JSON.parse(event.data);
			if (data.key) {
				const player = room.players[playerId];
				player.keysPressed = player.keysPressed || {};
				player.keysPressed[data.key] = data.isPressed;
	
				if (games[roomId]) {
					// log.debug(`Key event from ${playerId}: ${data.key}=${data.isPressed}`);
					games[roomId].keyDown(player.keysPressed, playerId);
				}
			}
			// log.debug("Parsed data channel message:", data);
		} catch (e) {
			log.error("Error parsing data channel message:", e);
		}
	};
	
	// Set up ICE candidate handling
	peerConnection.onicecandidate = (event) => {
		if (event.candidate) {
		log.info(`ICE candidate generated for ${playerId}`);
		io.to(playerId).emit('ice-candidate', event.candidate);
		log.debug(`Emitted ice-candidate to ${playerId}`);
		}
	};

	// Log ICE connection state changes
	peerConnection.oniceconnectionstatechange = () => {
		log.info(`ICE connection state change for ${playerId}: ${peerConnection.iceConnectionState}`);
	};
	
	room.players[playerId].peerConnection = peerConnection;
	room.players[playerId].dataChannel = dataChannel;
	
	peerConnection.createOffer()
		.then(offer => {
			return peerConnection.setLocalDescription(offer);
		})
		.then(() => {
			log.info(`Sending offer to player ${playerId}`);
			io.to(playerId).emit('offer', peerConnection.localDescription);
		})
		.catch(err => log.error(`Error creating offer for ${playerId}:`, err));
	}
}

function startGameLoop(roomId) {
	const room = rooms[roomId];
	const game = games[roomId];
	
	if (!game || !room) return;
	
	const gameLoop = () => {

	const startTime = Date.now();

	if (!game.isRunning())
		return ;
	// log.debug("Game running: " + roomId);

	if (game.getScores()[0] >= 5)
	{
		game.stop();
		resetRoomConnections(roomId);
		io.to(roomId).emit('gameOver', 1);
		//if (!notTournament) check here for when a game isnt tournament so 
		room.gameStarted = false; // you can rematch
		return ;
	}
	else if (game.getScores()[1] >= 5)
	{
		game.stop();
		resetRoomConnections(roomId);
		//if (!notTournament) check here for when a game isnt tournament so 
		room.gameStarted = false; // you can rematch
		io.to(roomId).emit('gameOver', 2);
		return ;
	}
		

	game.update();
	
	const positions = game.getPos();
	
	// Send game state to all players via their data channels
	for (const playerId in room.players) {
		const player = room.players[playerId];
		const dataChannel = player.dataChannel;
		
		if (dataChannel && dataChannel.readyState === 'open') {
		try {
			dataChannel.send(JSON.stringify({
			type: 'gameState',
			positions: positions,
			scores: game.getScores()
			}));
		} catch (err) {
			log.error(`Error sending game state to player ${playerId}:`, err);
		}
		}
	}

	const endTime = Date.now();
	const elapsed = endTime - startTime;
	const nextFrameDelay = Math.max(0, (1000 / 60) - elapsed);
	
	if (rooms[roomId]) {
		game.gameLoopTimer = setTimeout(gameLoop, nextFrameDelay);
	}
	};
	
	setImmediate(gameLoop);
}


function joinRoom(roomId, socket)
{
	if (Object.keys(rooms[roomId].players).length < 2) {
		if (Object.keys(rooms[roomId].players).length === 0) {
		rooms[roomId].hostId = socket.id;
		}
		
		rooms[roomId].players[socket.id] = {
		playerPosition: { x: 0, y: 0 },
		peerConnection: null,
		dataChannel: null,
		keysPressed: {}
		};

		socket.join(roomId);
		io.to(roomId).emit("playerJoined", Object.keys(rooms[roomId].players).length);
		log.info(`${socket.id} joined room ${roomId}`);
	} else {
		socket.emit("roomFull", roomId);
		return;
	}

	const numPlayers = Object.keys(rooms[roomId].players).length;
	log.info(`Players in room: ${numPlayers}`);

	// when room is full start game and initialize WebRTC
	if (Object.keys(rooms[roomId].players).length === 2) {
		const playerIds = Object.keys(rooms[roomId].players);
		io.sockets.sockets.get(playerIds[0]).emit("roomFull");
	}
}

function resetRoomConnections(roomId) {
	const room = rooms[roomId];
	if (!room) return;
	
	log.info(`Resetting WebRTC connections for room ${roomId}`);
	
	// Clean up existing connections for all players
	for (const playerId in room.players) {
	  const player = room.players[playerId];
	  
	  if (player.dataChannel) {
		player.dataChannel.close();
		player.dataChannel = null;
	  }
	  
	  if (player.peerConnection) {
		player.peerConnection.close();
		player.peerConnection = null;
	  }
	  
	  // Reset any other connection-related state
	  player.bufferedCandidates = [];
	}
  }