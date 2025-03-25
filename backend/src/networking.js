import { Server } from "socket.io";
import wrtc from "wrtc";
import { Game } from './game/game.js'

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
	io = new Server(server, {
		cors: {
		origin: "*", // Change to frontend URL whenever needed
		methods: ["GET", "POST"],
		allowedHeaders: ["Content-Type"],
		credentials: true
		},
	});

	io.on("connection", (socket) => {  
		console.log("A user connected:", socket.id);

		socket.on("disconnect", () => {
		console.log("User disconnected:", socket.id);
		
		// Clean up rooms and connections when a player disconnects
		for (const roomId in rooms) {
			if (rooms[roomId].players[socket.id]) {
			roomIds.freeRoom(roomId);
			delete rooms[roomId].players[socket.id];
			console.log(`Player ${socket.id} removed from room ${roomId}`);
			
			socket.to(roomId).emit("playerDisconnected", socket.id);
			
			// deleting room when its empty
			if (Object.keys(rooms[roomId].players).length === 0) {
				delete rooms[roomId];
				delete games[roomId];
				console.log(`Room ${roomId} deleted`);
			}
			}
		}
		});

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
		const playerRoom = [...socket.rooms][1];

		if (playerRoom) {
			const peerConnection = rooms[playerRoom].players[socket.id].peerConnection;
			if (peerConnection) {
			console.log(`Setting remote description for ${socket.id}`);
			peerConnection.setRemoteDescription(new wrtc.RTCSessionDescription(answer))
				.then(() => {
				console.log(`Remote description set successfully for ${socket.id}`);
				
				// Process any buffered candidates
				const bufferedCandidates = rooms[playerRoom].players[socket.id].bufferedCandidates || [];
				if (bufferedCandidates.length > 0) {
					console.log(`Processing ${bufferedCandidates.length} buffered ICE candidates for ${socket.id}`);
					
					for (const candidate of bufferedCandidates) {
					peerConnection.addIceCandidate(new wrtc.RTCIceCandidate(candidate))
						.catch(err => console.error(`Error adding buffered ICE candidate for ${socket.id}:`, err));
					}
					
					// Clear the buffer
					rooms[playerRoom].players[socket.id].bufferedCandidates = [];
				}
				})
				.catch(err => console.error(`Error setting remote description for ${socket.id}:`, err));
			}
		}
		});
	});
}

function initializeWebRTC(roomId) {
	const room = rooms[roomId];
	if (!room || Object.keys(room.players).length < 2) return;
	
	const playerIds = Object.keys(room.players);
	console.log(`Initializing WebRTC connections for room ${roomId} with players:`, playerIds);
	
	// Create separate connections for each player
	for (const playerId of playerIds) {
	const peerConnection = new wrtc.RTCPeerConnection({
		iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
	});
	
	const dataChannel = peerConnection.createDataChannel("gameData");
	
	dataChannel.onopen = () => {
		console.log(`Data channel open for player ${playerId}`);
		
		// When all connections are open game loop starts
		if (Object.values(room.players).every(player => 
		player.dataChannel && player.dataChannel.readyState === 'open')) {
		console.log("All connections established, starting game loop");
		startGameLoop(roomId);
		}
	};
	
	dataChannel.onclose = () => console.log(`Data channel closed for player ${playerId}`);
	
	dataChannel.onmessage = (event) => {
		try {
		console.log(`Received message from player ${playerId}:`, event.data);
		const data = JSON.parse(event.data);
		if (data.key) {
			const player = room.players[playerId];
			player.keysPressed = player.keysPressed || {};
			player.keysPressed[data.key] = data.isPressed;
			
			if (games[roomId]) {
			console.log(`Processing key event from ${playerId}: ${data.key}=${data.isPressed}`);
			games[roomId].keyDown(player.keysPressed, playerId);
			}
		}
		} catch (e) {
		console.error("Error parsing data channel message:", e);
		}
	};
	
	// Set up ICE candidate handling
	peerConnection.onicecandidate = (event) => {
		if (event.candidate) {
		console.log(`ICE candidate generated for ${playerId}`);
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
		console.log(`Sending offer to player ${playerId}`);
		io.to(playerId).emit('offer', peerConnection.localDescription);
		})
		.catch(err => console.error(`Error creating offer for ${playerId}:`, err));
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
			console.error(`Error sending game state to player ${playerId}:`, err);
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
		console.log(`${socket.id} joined room ${roomId}`);
		} else {
		socket.emit("roomFull", roomId);
		return;
		}

	console.log("Players in room:", Object.keys(rooms[roomId].players).length);

	// when room is full start game and initialize WebRTC
	if (Object.keys(rooms[roomId].players).length === 2) {
		const playerIds = Object.keys(rooms[roomId].players);
		games[roomId] = new Game(playerIds[0], playerIds[1]);

		initializeWebRTC(roomId);

		io.to(roomId).emit("startGame", roomId, rooms[roomId].hostId);
	}
}