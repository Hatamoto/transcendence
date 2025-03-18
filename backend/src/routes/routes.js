import { 
  getUserOpts, 
  getUsersOpts, 
  addUserOpts, 
  deleteUserOpts, 
  updateUserOpts, 
  updatePasswordOpts,
  loginUserOpts,
  dashboardOpts,
  userLogoutOpts,
  uploadOpts
} from '../schemas/userSchemas.js'

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
  fastify.get('/api/users/:id', getUserOpts)
  fastify.get('/api/logout', userLogoutOpts)
  fastify.post('/api/users', addUserOpts)
  fastify.post('/api/login', loginUserOpts)
  fastify.put('/api/upload', uploadOpts)
  fastify.put('/api/users/:id', updateUserOpts)
  fastify.put('/api/users/pwd/:id', updatePasswordOpts)
  fastify.delete('/api/users/:id', deleteUserOpts)
  fastify.get('/api/dashboard', dashboardOpts)  
}

export { root, userRoutes };