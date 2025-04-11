import dotenv from "dotenv"
import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import { root, userRoutes, friendRoutes } from './routes/routes.js'
import dbInit from './database.js'
import path from 'path'
import cookie from '@fastify/cookie'
import formbody from '@fastify/formbody'
import ejs from 'ejs'
import view from '@fastify/view'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import { fileURLToPath } from 'url';
import { setupNetworking } from './networking.js';
import { Logger, LogLevel } from './utils/logger.js';


// Compute __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIST = path.resolve(__dirname, '../../frontend/dist');

const log = new Logger(LogLevel.INFO);

log.info("Creating server")

dotenv.config();

const fastify = Fastify({
	logger: false
})

fastify.register(view, {
  engine: {
    ejs: ejs,
  },
})

// fastify.setTrustProxy(true); for web reverse proxy

const server = fastify.server;
setupNetworking(server);

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

await fastify.register(dbInit)
await fastify.register(formbody)
await fastify.register(cookie)
await fastify.register(multipart)
await fastify.register(root)
await fastify.register(userRoutes)
await fastify.register(friendRoutes)

fastify.listen({ port: process.env.PORT || 5001, host: process.env.HOST }, function (err, address) {
	log.info('Listening on port', process.env.PORT);
	if (err) {
		log.info('Error: ', err)
		fastify.log.error(err)
		process.exit(1)
	}
	log.info(`Server listening at ${address}`)
})
