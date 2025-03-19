import dotenv from "dotenv"
dotenv.config();
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
// import cors from '@fastify/cors';
// // Some CORS stuff
// await fastify.register(cors, {
// 	origin: true,           // Or explicitly set your frontend URL
// 	credentials: true,      // Allow cookies to be sent with requests
// });

// Correctly resolve __dirname for ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Frontend Directory:", path.resolve(__dirname, '../../frontend/dist'));
console.log("Backend Directory:", __dirname);

// Path to frontend output
const FRONTEND_DIST = path.resolve(__dirname, '../../frontend/dist');

console.log("Frontend Directory:", FRONTEND_DIST);

const fastify = Fastify({
  logger: true
})

await fastify.register(dbInit)
fastify.register(formbody)
fastify.register(cookie)
fastify.register(multipart)

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

await fastify.register(root)
await fastify.register(userRoutes)

fastify.listen({ port: process.env.PORT, host: process.env.HOST }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
});