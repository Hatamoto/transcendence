import { logoutUser, loginUser, getToken} from '../controllers/loginController.js'
import { authenticateToken } from '../middleware/authentication.js'

const logoutOpts = {
  schema: {
    body: {
      type: 'object',
      required: ['token'],
      properties: {
        token: {type: 'string' },
      },
    },
  },
  preHandler: authenticateToken,
  handler: logoutUser,
}

const loginOpts = {
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

const tokenOpts = {
  schema: {
    body: {
      type: 'object',
      properties: {
        token: { type: 'string' },
      },
    },
  },
  preHandler: authenticateToken,
  handler: getToken,
}

export { loginOpts, logoutOpts, tokenOpts }