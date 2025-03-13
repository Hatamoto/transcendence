import { 
  getUserOpts, 
  getUsersOpts, 
  addUserOpts, 
  deleteUserOpts, 
  updateUserOpts, 
  updatePasswordOpts,
  loginUserOpts,
  dashboardOpts,
  userLogoutOpts
} from '../schemas/userSchemas.js'

async function root (fastify, options) {
  fastify.get('/', async (req, reply) => {
    try {
      return reply.view('../public/index.html')
    } catch (error) {
      console.log(error)
    }
  })
}

async function userRoutes (fastify, options) {
  fastify.get('/api/users', getUsersOpts)
  fastify.get('/api/users/:id', getUserOpts)
  fastify.get('/api/dashboard', dashboardOpts)
  fastify.get('/api/logout', userLogoutOpts)
  fastify.post('/api/users', addUserOpts)
  fastify.post('/api/login', loginUserOpts)
  fastify.put('/api/users/:id', updateUserOpts)
  fastify.put('/api/users/pwd/:id', updatePasswordOpts)
  fastify.delete('/api/users/:id', deleteUserOpts)
}

export { root, userRoutes };