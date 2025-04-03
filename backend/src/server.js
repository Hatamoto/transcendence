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


// Compute __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const fastify = Fastify({
	logger: true
})

await fastify.register(dbInit)
fastify.register(formbody)
fastify.register(cookie)
fastify.register(multipart)
fastify.register(fastifyStatic, {
  root: path.join(process.cwd(), '../public'),
  prefix: '/',
})
fastify.register(fastifyStatic, {
  root: path.join(process.cwd(), "../avatars"),
  prefix: "/avatars/",
  decorateReply: false,
});
fastify.register(jwt, {
  secret: process.env.ACCESS_TOKEN_SECRET,
})
fastify.register(view, {
  engine: {
    ejs: ejs,
  },
})

await fastify.register(root)
await fastify.register(userRoutes)
await fastify.register(friendRoutes)

fastify.listen({ port: process.env.PORT || 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
