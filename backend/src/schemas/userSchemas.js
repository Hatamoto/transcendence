import { 
  getUsers,
  addUser,
  getUser,
  deleteUser,
  updateUser,
  updatePassword,
  getDashboard,
  userLogout,
  uploadAvatar,
  getGameroom,
  getGame
} from '../controllers/UserController.js'
import authenticateToken from '../middleware/authentication.js'
import authenticate from '../middleware/authentication.js';
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
      required: ['name', 'email', 'number', 'password'],
      properties: {
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        number: {
          type: 'string',
          pattern: "^\\+\\d{6,15}$",
        },
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
  schema: {
	type: 'object',
  },
  preHandler: authenticateToken,
  handler: getDashboard,
}

const gameroomOpts = {
	schema: {
	  type: 'object',
	},
	preHandler: authenticateToken,
	handler: getGameroom,
}

const gameOpts = {
	schema: {
		type: 'object',
	},
	preHandler: authenticateToken,
	handler: getGameroom,
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
  preHandler: authenticate,
  handler: uploadAvatar,
}

const tfaEnableOpts = {
  schema: {
    body: {
      type: 'object',
      required: ['method'],
      properties: {
        method: { type: 'string' },
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
  handler: tfaEnable,
}

const tfaDisableOpts = {
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
  preHandler: authenticateToken,
  handler: tfaDisable,
}


export {
  getUserOpts,
  getUsersOpts,
  addUserOpts,
  deleteUserOpts,
  updateUserOpts,
  updatePasswordOpts,
  dashboardOpts,
<<<<<<< HEAD
  gameroomOpts,
  gameOpts,
  userLogoutOpts,
  uploadOpts
=======
  uploadOpts,
  tfaEnableOpts,
  tfaDisableOpts
>>>>>>> origin/Merging-front&backend
}