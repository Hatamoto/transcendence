import dotenv from "dotenv"
dotenv.config();
import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import { root, userRoutes } from './routes/routes.js'
import dbInit from './database.js'
import path from 'path'
// import session from '@fastify/session'
import cookie from '@fastify/cookie'
import formbody from '@fastify/formbody'
import ejs from 'ejs'
import view from '@fastify/view'
import jwt from '@fastify/jwt'

const fastify = Fastify({
  logger: true
})

await fastify.register(dbInit)
fastify.register(formbody)
fastify.register(cookie)
fastify.register(fastifyStatic, {
  root: path.join(process.cwd(), '../public'),
  prefix: '/', // Serve files from the root URL
})
// fastify.register(session, {
//   secret: "a secret with minimum length of 32 characters",
//   cookie: {
//     secure: false,  // Make sure to leave this as false for non-HTTPS connections
//     httpOnly: true,  // For security, prevent JS access
//     sameSite: 'Lax', // Add SameSite for better cross-site cookie handling
//   },
//   saveUninitialized: false,
// })
fastify.register(jwt, {
  secret: process.env.ACCESS_TOKEN_SECRET,
})

console.log("DATABASE URL:", process.env.DATABASE_URL)
console.log("PORT:", process.env.PORT)
console.log("jwt secret:", process.env.ACCESS_TOKEN_SECRET)
console.log("REFRESH TOKEN:", process.env.REFRESH_TOKEN_SECRET)

fastify.register(view, {
  engine: {
    ejs: ejs,
  },
})
await fastify.register(root)
await fastify.register(userRoutes)

fastify.listen({ port: process.env.PORT }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})