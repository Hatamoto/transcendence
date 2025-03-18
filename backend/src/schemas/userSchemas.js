import { 
  getUsers,
  addUser,
  getUser,
  deleteUser,
  updateUser,
  updatePassword,
  loginUser,
  getDashboard,
  userLogout,
  uploadAvatar
} from '../controllers/UserController.js'
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
          pattern: '^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};\'":,.<>?])',
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
    params: {
      type: 'object',
      properties: {
        id: { type: 'integer', minimum: 1 }
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
    response: {
      200: User,
    },
  },
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
  handler: updatePassword,
}

const loginUserOpts = {
  schema: {
    body: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
        username: { type: 'string' },
        password: { type: 'string' },
      },
    },
  },
  handler: loginUser,
}

const dashboardOpts = {
  schema: {
	type: 'object',
  },
  preHandler: authenticateToken,
  handler: getDashboard,
}

const userLogoutOpts = {
  schema: {
    response: {
      200: {
		type: 'object',
	  },
    },
  },
  handler: userLogout,
}

const uploadOpts = {
  schema: {
    response: {
      204: {
		type: 'object',
	  },
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
  loginUserOpts,
  dashboardOpts,
  userLogoutOpts,
  uploadOpts
}