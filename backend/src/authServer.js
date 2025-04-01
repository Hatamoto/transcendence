import dotenv from "dotenv"
import Fastify from 'fastify'
import { loginRoutes } from './routes/routes.js'
import dbInit from './database.js'
import jwt from '@fastify/jwt'
import nodeMailer from 'fastify-nodemailer'

dotenv.config();

const fastify = Fastify({
  logger: true
})

await fastify.register(dbInit)
await fastify.register(loginRoutes)
fastify.register(jwt, {
  secret: process.env.ACCESS_TOKEN_SECRET,
})
fastify.register(nodeMailer, {
  pool: true,
  host: 'smtp.transendence.com',
  port: 465,
  secure: true,
  auth: {
    user: 'username',
    pass: 'password'
  }
})

fastify.listen({ port: process.env.AUTH_PORT || 4000 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(`authServer listening at ${address}`)
})