import dotenv from "dotenv"
dotenv.config();
import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import { root, userRoutes } from './routes/routes.js'
import dbInit from './database.js'
import path from 'path'
import cookie from '@fastify/cookie'
import formbody from '@fastify/formbody'
import ejs from 'ejs'
import view from '@fastify/view'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
// temp
// import bcrypt from 'bcrypt';

// bcrypt.hash('Test123!', 10, (err, hash) => {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log('Generated hash:', hash);
//   }
// });

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
  root: path.join(process.cwd(), "./src/avatars"),
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

fastify.listen({ port: process.env.PORT }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})