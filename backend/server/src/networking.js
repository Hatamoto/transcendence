import { Server } from "socket.io";
import wrtc from "wrtc";
import { Game } from './game/game.js';
import { Logger, LogLevel } from './utils/logger.js';
import { startChat } from "./chat.js";

const log = new Logger(LogLevel.INFO);

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


    allocate() {	// Finds available ids
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

    freeRoom(id) { 	// Completely deletes the rooms id
		this.freeIDs.add(Number(id));
		if (this.openRooms.has(id))
			this.openRooms.delete(id);
    }

	openRoomDoors(id) { 	// Lets players join again
		this.openRooms.add(id);
	}

	closeRoomDoors(id) {	// Closes the room so players cant join
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
			const playerRoom = socket.room;
				if (playerRoom && rooms[playerRoom]?.players[socket.id]) {
					delete rooms[playerRoom].players[socket.id];
					log.info(`Player ${socket.id} removed from room ${playerRoom}`);
					
					if (Object.keys(rooms[playerRoom].players).length === 0) {
						// Room cleanup
						delete rooms[playerRoom];
						if (games[playerRoom]) {
							games[playerRoom].stop();
							delete games[playerRoom];
						}
						roomIds.freeRoom(playerRoom);
						log.info(`Room ${playerRoom} deleted`);
					} else if (rooms[playerRoom].type == "normal") {
						roomIds.openRoomDoors(playerRoom);
					}
					
					// Notify remaining players
					io.to(playerRoom).emit("playerDisconnected", Object.keys(rooms[playerRoom].players).length);
			}
		});

		socket.on('ice-candidate', (candidate) => {
			log.info(`Received ICE candidate from frontend socket ${socket.id}`);
			log.debug('Candidate:', candidate);
			const playerRoom = socket.room;
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

		//socket.on("joinRoom", (roomId) => {
		//	if (!rooms[roomId]) {
		//		rooms[roomId] = {
		//		players: {},
		//		gameStarted: false,
		//		hostId: null
		//		};
		//	}
		//	joinRoom(roomId, socket);
		//});

		socket.on("readyTour", () => {
			// allocate a room when both players are ready in the database
		});

		socket.on("joinRoomQue", () => {
			if (socket.rooms.size > 1)
				return ;
			const roomId = roomIds.allocate();
			if (roomId == -1)
				return ;
			if (!rooms[roomId]) {
				roomIds.openRoomDoors(roomId);
				rooms[roomId] = {
				players: {},
				gameStarted: false,
				hostId: null,
				type: "normal" // Games matchmaking type
				};
			}
			else
				roomIds.closeRoomDoors(roomId);
			joinRoom(roomId, socket);
		});

		socket.on('hostStart', (settings) => {
			const playerRoom = socket.room;
			if (!playerRoom || !rooms[playerRoom] || rooms[playerRoom].hostId != socket.id) return;

			if (Object.keys(rooms[playerRoom].players).length === 2 && !rooms[playerRoom].gameStarted) {
				const playerIds = Object.keys(rooms[playerRoom].players);
				rooms[playerRoom].gameStarted = true;

				games[playerRoom] = new Game(playerIds[0], playerIds[1]);
				games[playerRoom].settings(settings);		
				initializeWebRTC(playerRoom);
				log.info("HOSTSROOM: " + playerRoom);
				const socketsInRoomAdapter = io.sockets.adapter.rooms.get(playerRoom);
				log.info(`Adapter state for room ${playerRoom} right before emit: Size=${socketsInRoomAdapter?.size}, IDs=${[...socketsInRoomAdapter || []]}`);
				
				io.to(playerRoom).emit("startGame", playerRoom, settings);
			}
		});

		socket.on('answer', (answer) => {
		log.info(`Backend received answer from ${socket.id}:`);
		log.debug('Answer:', answer);
		const playerRoom = socket.room;

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
	
	if (playerIds.some(id => room.players[id].peerConnection)) {
		log.info(`WebRTC already initialized for room ${roomId}, skipping`);
		startGameLoop(roomId);
		return;
	}

	log.info(`Initializing WebRTC connections for room ${roomId} with players:`, playerIds);
	
	log.debug("TURN server:", process.env.TURN_URL);
	log.debug("TURN server credentials:", process.env.TURN_USER, process.env.TURN_PASS);
	log.debug("STUN server:", process.env.STUN_URL);

	const iceServers = [
		{
			urls: process.env.TURN_URL,  // Use the service name "turn" from docker-compose
			username: process.env.TURN_USER,
			credential: process.env.TURN_PASS
		},
		{
			urls: process.env.STUN_URL
		}
		];
	log.info("ICE config loaded:");
	log.info(iceServers);
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

	const startTime = Date.now();

	if (!game.isRunning())
		return ;
	log.info("Game running: " + roomId);

	if (game.getScores()[0] >= 5)
	{
		game.stop();
		io.to(roomId).emit('gameOver', 1);
		//if (!notTournament) check here for when a game isnt tournament so 
			room.gameStarted = false; // you can rematch
		return ;
	}
	else if (game.getScores()[1] >= 5)
	{
		game.stop();
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

		socket.room = roomId;
		socket.join(roomId);

		io.to(roomId).emit("playerJoined", Object.keys(rooms[roomId].players).length);
		log.info(`${socket.id} joined room ${roomId}`);
	}

	const numPlayers = Object.keys(rooms[roomId].players).length;
	log.info(`Players in room: ${numPlayers}`);

	// when room is full start game and initialize WebRTC
	if (Object.keys(rooms[roomId].players).length === 2) {
		const playerIds = Object.keys(rooms[roomId].players);
		io.sockets.sockets.get(playerIds[0]).emit("roomFull");
	}
}