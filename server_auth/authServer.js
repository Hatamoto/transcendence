import dotenv from "dotenv"
import Fastify from 'fastify'
import loginRoutes from './routes/authRoutes.js'
import dbInit from './database.js'
import jwt from '@fastify/jwt'

dotenv.config();

const fastify = Fastify({
  logger: true
})

await fastify.register(dbInit)
await fastify.register(loginRoutes)
fastify.register(jwt, {
  secret: process.env.ACCESS_TOKEN_SECRET,
})

fastify.listen({ port: process.env.AUTH_PORT || 4000, host: '0.0.0.0' }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(`authServer listening at ${address}`)
})