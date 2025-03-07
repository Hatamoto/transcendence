import { getUsers, addUser, getUser, deleteUser, updateUser, updatePassword } from '../controllers/UserController.js'

const User = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
  },
}

const getUsersOpts = {
  schema: {
    response: {
      200: {
        type: 'array',
        items: User,
      },
    },
  },
  handler: getUsers,
}

const addUserOpts = {
  schema: {
    body: {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
      },
    },
    response: {
      201: User,
    },
  },
  handler: addUser,
}

const getUserOpts = {
  schema: {
    response: {
      200: User,
    },
  },
  handler: getUser,
}

const deleteUserOpts = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  handler: deleteUser,
}

const updateUserOpts = {
  schema: {
    response: {
      200: User,
    },
  },
  handler: updateUser,
}

const updatePasswordOpts = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  handler: updatePassword,
}

async function root (fastify, options) {
  fastify.get('/', async (request, reply) => {
    try {
      return reply.sendFile('index.html')
    } catch (error) {
      console.log(error)
    }
  })
}

async function userRoutes (fastify, options) {
  fastify.get('/api/users', getUsersOpts)
  fastify.get('/api/users/:id', getUserOpts)
  fastify.post('/api/users', addUserOpts)
  fastify.put('/api/users/:id', updateUserOpts)
  fastify.put('/api/users/pwd/:id', updatePasswordOpts)
  fastify.delete('/api/users/:id', deleteUserOpts)
}

export { root, userRoutes };