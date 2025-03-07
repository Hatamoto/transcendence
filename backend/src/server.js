import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import { root, userRoutes } from './routes/routes.js'
import dbInit from './database.js'
import dotenv from "dotenv";
import path from 'path'

dotenv.config();

const fastify = Fastify({
  logger: true
})

fastify.register(fastifyStatic, {
  root: path.join(process.cwd(), '../public'),
  prefix: '/', // Serve files from the root URL
})

await fastify.register(dbInit)
await fastify.register(root)
await fastify.register(userRoutes)

fastify.listen({ port: process.env.PORT }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})