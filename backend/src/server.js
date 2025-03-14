import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import { root, userRoutes } from './routes/routes.js'
import dbInit from './database.js'
import dotenv from "dotenv";
import path from 'path'
import { fileURLToPath } from 'url';
import { Server } from "socket.io";
import { Game } from '../dist/game.js'

dotenv.config();

// Compute __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
  //logger: true
})
const server = fastify.server;
const game = new Game();

const io = new Server(server, {
	cors: {
	  origin: "*", // Change to frontend URL whenever needed
	  methods: ["GET", "POST"],
	  allowedHeaders: ["Content-Type"],
	  credentials: true
	},
  });

  const activeSockets = new Set();

  io.on("connection", (socket) => {  
	if (activeSockets.has(socket.id)) { // prevents same id connecting multiple times maybe not needed
		console.log(`User ${socket.id} is already connected. Disconnecting the new connection.`);
		socket.disconnect();
		return;
	}
	activeSockets.add(socket.id);
	console.log("A user connected:", socket.id);
	//socket.on('keysPressed', (data) => {
	//	Game.keysPressed = data;
	//	console.log("asd");
	//});

	socket.on("joinRoom", (room) => {
		const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
		console.log(roomSize);
		if (!socket.rooms.has(room) || roomSize != 1)
		{
			socket.join(room);
			console.log(`User ${socket.id} joined room: ${room}`);
			io.to(room).emit("message", `User ${socket.id} has joined ${room}`);
			if (roomSize == 1)
				console.log("Starting game!");
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
  });

	// Serve static files from the public directory
	// Adjust the relative paths based on the location of this file
	fastify.register(fastifyStatic, {
		root: path.join(__dirname, '../../public'), // e.g., if this file is in backend/src, resolves to /app/public
		prefix: '/',
		decorateReply: true
	});
		
	// Serve static files from the dist directory
	fastify.register(fastifyStatic, {
		root: path.join(__dirname, '../dist'), // e.g., resolves to /app/backend/dist
		prefix: '/dist/',
		decorateReply: false 
	});

await fastify.register(dbInit)
await fastify.register(root)
await fastify.register(userRoutes)

// fastify.listen({ port: process.env.PORT || 5000}, function (err, address) {
//   if (err) {
//     fastify.log.error(err)
//     process.exit(1)
//   }
//   console.log(`Server listening at ${address}`)
// })

// For Docker to work:
fastify.listen({ 
	port: process.env.PORT || 5000, 
	host: '0.0.0.0' 
  }, function (err, address) {
	if (err) {
	  fastify.log.error(err)
	  process.exit(1)
	}
	console.log(`Server listening at ${address}`)
  })