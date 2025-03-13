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
const game = new Game();

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
  
	socket.on('keysPressed', (data) => {
		Game.keysPressed = data;
		console.log("asd");
	});
	
	socket.on("disconnect", () => {
	  console.log("User disconnected:", socket.id);
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