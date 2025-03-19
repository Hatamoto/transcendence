import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import { root, userRoutes } from './routes/routes.js'
import dbInit from './database.js'
import dotenv from "dotenv";
import path from 'path'
import { Server } from "socket.io";
import wrtc from "wrtc";
import { Game } from '../dist/game.js'


dotenv.config();

const fastify = Fastify({
	//logger: true
})
const server = fastify.server;
const games = {};
const rooms = {};

//function gameLoop(room) {
//	io.to(room).emit("updateGame", games[room].getPos());
	
//	setTimeout(() => gameLoop(room), 1000 / 60);
//}

const io = new Server(server, {
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
	});

	socket.on("joinRoom", (roomId) => {
		if (!rooms[roomId]) {
            rooms[roomId] = {
                players: {},
                peerConnections: {}
            };
        }

        // Add the player to the room
		if (Object.keys(rooms[roomId].players).length <= 1) {
			rooms[roomId].players[socket.id] = {
				playerPosition: { x: 0, y: 0 },
				dataChannel: null
			};

			socket.join(roomId);
			console.log(`${socket.id} joined room ${roomId}`);
		}

		console.log("Players in room:", Object.keys(rooms[roomId].players).length );

		console.log("Host: ", Object.keys(rooms[roomId].players)[0]);

		if (Object.keys(rooms[roomId].players).length  == 2)
			io.to(roomId).emit("startGame", roomId, Object.keys(rooms[roomId].players)[0]);
	});

	socket.on('offer', (offer) => {

        socket.broadcast.emit('offer', offer);

    });


    socket.on('answer', (answer) => {

        socket.broadcast.emit('answer', answer);

    });


    socket.on('ice-candidate', (candidate) => {
		console.log("ice-candidate", candidate);
        socket.broadcast.emit('ice-candidate', candidate);

    });
	
  });

	// First static directory
	fastify.register(fastifyStatic, {
		root: path.join(process.cwd(), '../public'),
		prefix: '/',
		decorateReply: true
	})

	fastify.register(fastifyStatic, {
		root: path.join(process.cwd(), './dist/'),
		prefix: '/dist/',
		decorateReply: false 
	})

await fastify.register(dbInit)
await fastify.register(root)
await fastify.register(userRoutes)

fastify.listen({ port: process.env.PORT || 5000}, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})