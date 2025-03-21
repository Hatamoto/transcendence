import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { root, userRoutes } from './routes/routes.js';
import dbInit from './database.js';
import dotenv from "dotenv";
import path from 'path';
import { setupNetworking } from './networking.js';

dotenv.config();

const fastify = Fastify({
	//logger: true
})
export const server = fastify.server;
setupNetworking(server);

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