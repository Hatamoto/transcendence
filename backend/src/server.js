import dotenv from "dotenv"
import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import { root, userRoutes } from './routes/routes.js'
import dbInit from './database.js'
import path from 'path'
import { fileURLToPath } from 'url';
import cookie from '@fastify/cookie'
import formbody from '@fastify/formbody'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import { setupNetworking } from './networking.js';
import { Logger, LogLevel } from './utils/logger.js';

const log = new Logger(LogLevel.INFO);

log.info("[BACKEND] Server ready")


dotenv.config();

// import cors from '@fastify/cors';
// // Some CORS stuff
// await fastify.register(cors, {
// 	origin: true,           // Or explicitly set your frontend URL
// 	credentials: true,      // Allow cookies to be sent with requests
// });

// Correctly resolve __dirname for ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Path to frontend output
const FRONTEND_DIST = path.resolve(__dirname, '../../frontend/dist');

const fastify = Fastify({
  // logger: true
})

export const server = fastify.server;
console.log('Server created');
setupNetworking(server);
console.log('Networking setup');

// Serve frontend files
fastify.register(fastifyStatic, {
    root: FRONTEND_DIST,
    prefix: '/',
});

// Serve avatars
fastify.register(fastifyStatic, {
    root: path.join(__dirname, './avatars'),
    prefix: '/avatars/',
    decorateReply: false,
});

fastify.register(jwt, {
    secret: process.env.ACCESS_TOKEN_SECRET,
});

fastify.setNotFoundHandler((req, reply) => {
    reply.sendFile('index.html', { root: FRONTEND_DIST });
});

console.log('Static files served');
await fastify.register(dbInit)
await fastify.register(formbody)
await fastify.register(cookie)
await fastify.register(multipart)
await fastify.register(root)
await fastify.register(userRoutes)

console.log('Routes registered');
fastify.listen({ port: process.env.PORT, host: process.env.HOST }, function (err, address) {
	console.log('Listening on port', process.env.PORT);
	if (err) {
		console.log('Error: ', err)
		fastify.log.error(err)
		process.exit(1)
	}
	console.log(`Server listening at ${address}`)
})
