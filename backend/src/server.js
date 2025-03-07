import Fastify from 'fastify'
import { root, userRoutes } from './routes/routes.js'
import dbInit from './database.js'
import dotenv from "dotenv";

dotenv.config();

const fastify = Fastify({
  logger: true
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