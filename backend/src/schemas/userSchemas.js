import { 
  getUsers,
  addUser,
  getUser,
  deleteUser,
  updateUser,
  updatePassword,
  loginUser,
  getDashboard,
  userLogout
} from '../controllers/UserController.js'
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
    response: {
      200: {},
    },
  },
  handler: loginUser,
}

const dashboardOpts = {
  schema: {
    response: {
      200: User,
    },
  },
  handler: getDashboard,
}

const userLogoutOpts = {
  schema: {
    response: {
      200: {},
    },
  },
  handler: userLogout,
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
  userLogoutOpts
}