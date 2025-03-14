import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import { root, userRoutes } from './routes/routes.js'
import dbInit from './database.js'
import dotenv from "dotenv";
import path from 'path'
import { Server } from "socket.io";
import { Game } from '../dist/game.js'

dotenv.config();

const fastify = Fastify({
  //logger: true
})
const server = fastify.server;
let game;

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

	socket.on("joinRoom", (room) => {
		const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
		console.log(roomSize);
		if (!socket.rooms.has(room) || roomSize != 1)
		{
			socket.join(room);
			console.log(`User ${socket.id} joined room: ${room}`);
			io.to(room).emit("message", `User ${socket.id} has joined ${room}`);
			if (roomSize == 1)
			{
				console.log("Starting game!");
				io.to(room).emit("startGame");
				const playerIds = Array.from(io.sockets.adapter.rooms.get(room) || []);
				game = new Game(playerIds[0], playerIds[1]);
			}
		}
		else if(roomSize == 2)
		{
			console.log(`Room ${room} is already full!`);
		}
		else
		{
			console.log(`User ${socket.id} is already in a room!`);
		}

	  });
	
	socket.on("disconnect", () => {
	  console.log("User disconnected:", socket.id);
	});

	socket.on("keysPressed", (e) => {
		game.keyDown(e, socket.id);
		game.update(game);
		io.to(1).emit("updateGame", game.getPlayerPos());
		console.log(game.getPlayerPos());
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