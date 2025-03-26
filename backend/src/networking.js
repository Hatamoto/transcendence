import { Server } from "socket.io";
import wrtc from "wrtc";
import { Game } from './game/game.js';
import { Logger, LogLevel } from './utils/logger.js';

const log = new Logger(LogLevel.INFO);

global.RTCPeerConnection = wrtc.RTCPeerConnection;
global.RTCSessionDescription = wrtc.RTCSessionDescription;
global.RTCIceCandidate = wrtc.RTCIceCandidate;

class IDAllocator {
    constructor(maxID) {
        this.maxID = maxID;
        this.openRooms = new Set();
		this.freeIDs = new Set();
		for (let i = 0; i < maxID; i++) {
			this.freeIDs.add(i);
		}
    }

    allocate() {
		if (this.openRooms.size > 0) {
			return (this.openRooms.values().next().value);
    	}
		else if (this.freeIDs.size > 0) {
			this.freeIDs.delete(this.freeIDs.values().next().value);
			return (this.freeIDs.values().next().value);
		}
		else 
			return (-1);
	}

    freeRoom(id) {
		this.freeIDs.add(id);
		if (this.openRooms.has(id))
			this.openRooms.delete(id);
    }

	openRoom(id) {
		this.openRooms.add(id);
	}

	closeRoom(id) {
		this.openRooms.delete(id);
	}
}

let io;
const games = {};
const rooms = {};
const roomIds = new IDAllocator(1000);

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
				roomIds.freeRoom(roomId);
				delete rooms[roomId].players[socket.id];
				log.info(`Player ${socket.id} removed from room ${roomId}`);
				
				socket.to(roomId).emit("playerDisconnected", socket.id);
				
				// deleting room when its empty
				if (Object.keys(rooms[roomId].players).length === 0) {
					delete rooms[roomId];
					delete games[roomId];
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

		socket.on("connect", () => log.info("socket.io connected:", socket.id));

		socket.on("joinRoom", (roomId) => {
			if (!rooms[roomId]) {
				rooms[roomId] = {
				players: {},
				hostId: null
				};
			}
			joinRoom(roomId, socket);
		});


		socket.on("joinRoomQue", () => {
			const roomId = roomIds.allocate();
			if (roomId == -1 || socket.rooms.size > 1)
				return ;
			if (!rooms[roomId]) {
				roomIds.openRoom(roomId);
				rooms[roomId] = {
				players: {},
				hostId: null
				};
			}
			else
				roomIds.closeRoom(roomId);
			joinRoom(roomId, socket);
		});

		socket.on('answer', (answer) => {
		log.info(`Backend received answer from ${socket.id}:`);
		log.debug('Answer:', answer);
		const playerRoom = [...socket.rooms][1];

		if (playerRoom) {
			const peerConnection = rooms[playerRoom].players[socket.id].peerConnection;
			if (peerConnection) {
				log.info(`Setting remote description for socket ${socket.id} in room ${playerRoom}`);
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
	log.info(`Initializing WebRTC connections for room ${roomId} with players:`, playerIds);
	
	const iceServers = [
		{
			urls: 'turn:turn:3478',  // Use the service name "turn" from docker-compose
			username: 'user',
			credential: 'pass'
		},
		{
			urls: 'stun:stun.l.google.com:19302'
		}
		];

	// Create separate connections for each player
	for (const playerId of playerIds) {
		const peerConnection = new RTCPeerConnection({ iceServers });
	
		const dataChannel = peerConnection.createDataChannel("gameData");
	
		// ADD THIS LINE CLEARLY:
		room.players[playerId].dataChannel = dataChannel;
	
		dataChannel.onopen = () => {
			log.info(`Data channel open for player ${playerId}`);
	
			if (Object.values(room.players).every(player => 
				player.dataChannel && player.dataChannel.readyState === 'open')) {
				log.info("All connections established, starting game loop");
				startGameLoop(roomId);
			}
		};
	
	dataChannel.onclose = () => log.info(`Data channel closed for player ${playerId}`);
	
	dataChannel.onmessage = (event) => {
		log.debug("Received data channel message:", event.data);
		try {
			const data = JSON.parse(event.data);
			if (data.key) {
				const player = room.players[playerId];
				player.keysPressed = player.keysPressed || {};
				player.keysPressed[data.key] = data.isPressed;
	
				if (games[roomId]) {
					log.debug(`Key event from ${playerId}: ${data.key}=${data.isPressed}`);
					games[roomId].keyDown(player.keysPressed, playerId);
				}
			}
		} catch (e) {
			log.error("Error parsing data channel message:", e);
		}
	};
	
	// Set up ICE candidate handling
	peerConnection.onicecandidate = (event) => {
		if (event.candidate) {
		log.info(`ICE candidate generated for ${playerId}`);
		io.to(playerId).emit('ice-candidate', event.candidate);
		}
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
	game.update(game);
	
	const positions = game.getPos();
	
	// Send game state to all players via their data channels
	for (const playerId in room.players) {
		const player = room.players[playerId];
		const dataChannel = player.dataChannel;
		
		if (dataChannel && dataChannel.readyState === 'open') {
		try {
			dataChannel.send(JSON.stringify({
			type: 'gameState',
			positions: positions
			}));
		} catch (err) {
			log.error(`Error sending game state to player ${playerId}:`, err);
		}
		}
	}
	
	if (rooms[roomId]) {
		setTimeout(gameLoop, 1000 / 60); // 60 FPS
	}
	};
	
	gameLoop();
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
		games[roomId] = new Game(playerIds[0], playerIds[1]);

		initializeWebRTC(roomId);

		io.to(roomId).emit("startGame", roomId, rooms[roomId].hostId);
	}
}