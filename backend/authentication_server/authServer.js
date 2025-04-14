import dotenv from "dotenv"
import Fastify from 'fastify'
import loginRoutes from './routes/authRoutes.js'
import dbInit from '../server/src/database.js'
import jwt from '@fastify/jwt'
import cors from '@fastify/cors'

dotenv.config({ path: "../.env" });

const fastify = Fastify({
  logger: true
})

await fastify.register(dbInit)
await fastify.register(loginRoutes)
await fastify.register(cors, {
	origin: 'http://localhost:5001',
	credentials: true
})
fastify.register(jwt, {
  secret: process.env.ACCESS_TOKEN_SECRET,
})

fastify.listen({ port: process.env.AUTH_PORT || 4000 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(`authServer listening at ${address}`)
})