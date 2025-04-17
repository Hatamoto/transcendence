import { 
  getUsers,
  addUser,
  getUser,
  deleteUser,
  updateUser,
  updatePassword,
  getDashboard,
  uploadAvatar
} from '../controllers/userController.js'
import authenticateToken from '../middleware/authentication.js'
import User from '../models/userModel.js'

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
        email: { type: 'string', format: 'email' },
        password: { 
          type: 'string',
          minLength: 8,
         },
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
    params: {
      type: 'object',
      properties: {
        id: { type: 'integer', minimum: 1 }
      },
    },
    response: {
      200: User,
    },
  },
  handler: getUser,
}

const deleteUserOpts = {
  schema: {
    body: {
      type: 'object',
      required: ['id', 'token'],
      properties: {
        id: { type: 'integer', minimum: 1 },
        token: { type: 'string' }
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  preHandler: authenticateToken,
  handler: deleteUser,
}

const updateUserOpts = {
  schema: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'integer', minimum: 1 }
      },
    },
    body: {
      type: 'object',
      required: ['name', 'email', 'number'],
      properties: {
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        number: {
          type: 'string',
          pattern: "^\\+\\d{6,15}$",
        },
      },
    },
    response: {
      200: User,
    },
  },
  preHandler: authenticateToken,
  handler: updateUser,
}

const updatePasswordOpts = {
  schema: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'integer', minimum: 1 },
      },
    },
    body: {
      type: 'object',
      required: ['password'],
      properties: {
        password: { 
          type: 'string',
          minLength: 8,
         },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  preHandler: authenticateToken,
  handler: updatePassword,
}

const dashboardOpts = {
  schema: {},
  preHandler: authenticateToken,
  handler: getDashboard,
}

const uploadOpts = {
  schema: {
    response: {
      204: {},
    },
  },
  preHandler: authenticateToken,
  handler: uploadAvatar,
}

export {
  getUserOpts,
  getUsersOpts,
  addUserOpts,
  deleteUserOpts,
  updateUserOpts,
  updatePasswordOpts,
  dashboardOpts,
  uploadOpts
}