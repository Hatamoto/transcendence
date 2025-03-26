import { 
  getUserOpts, 
  getUsersOpts, 
  addUserOpts, 
  deleteUserOpts, 
  updateUserOpts, 
  updatePasswordOpts,
  dashboardOpts,
  uploadOpts
} from '../schemas/userSchemas.js'
import { loginOpts, logoutOpts, tokenOpts } from '../schemas/loginSchemas.js'
import friendRequestOpts from '../schemas/friendSchemas.js'

async function root (fastify, options) {
  fastify.get('/', async (req, reply) => {
    try {
      return reply.view('../public/index.ejs')
    } catch (error) {
      console.log(error)
    }
  })
}

async function userRoutes (fastify, options) {
  fastify.get('/api/users', getUsersOpts)
  fastify.get('/api/user/:id', getUserOpts)
  fastify.post('/api/user', addUserOpts)
  fastify.put('/api/upload', uploadOpts)
  fastify.put('/api/user/:id', updateUserOpts)
  fastify.put('/api/user/pwd/:id', updatePasswordOpts)
  fastify.delete('/api/user/:id', deleteUserOpts)
  fastify.get('/api/dashboard', dashboardOpts)  
}

async function loginRoutes (fastify, options) {
  fastify.post('/api/login', loginOpts)
  fastify.post('/api/token', tokenOpts)
  fastify.delete('/api/logout', logoutOpts)
}

async function friendRoutes (fastify, options) {
  fastify.post('/api/friend/request', friendRequestOpts)
}

export { root, userRoutes, loginRoutes, friendRoutes }