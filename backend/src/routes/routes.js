import { 
  getUserOpts, 
  getUsersOpts, 
  addUserOpts, 
  deleteUserOpts, 
  updateUserOpts, 
  updatePasswordOpts,
  loginUserOpts
} from '../schemas/userSchemas.js'

async function root (fastify, options) {
  fastify.get('/', async (req, reply) => {
    try {
      return reply.sendFile('index.ejs')
    } catch (error) {
      console.log(error)
    }
  })
}

async function userRoutes (fastify, options) {
  fastify.get('/api/users', getUsersOpts)
  fastify.get('/api/users/:id', getUserOpts)
  fastify.post('/api/users', addUserOpts)
  fastify.post('/api/login', loginUserOpts)
  fastify.put('/api/users/:id', updateUserOpts)
  fastify.put('/api/users/pwd/:id', updatePasswordOpts)
  fastify.delete('/api/users/:id', deleteUserOpts)
  fastify.get('/api/dashboard', async (req, reply) => {
    console.log('Session data:', req.session)
    console.log(`session user ${req.session.user}`)
    if (req.session.user) {
      const username = req.session.user
      return reply.view('../public/dashboard.ejs', { username })
    } else {
      return reply.redirect('/')
    }
  })
}

export { root, userRoutes };