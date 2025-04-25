import { logoutUser, loginUser, getToken, googleAuthHandler } from '../controllers/loginController.js'
import authenticateToken from '../../server/src/middleware/authentication.js'

const logoutOpts = {
  schema: {
    body: {
      type: 'object',
      required: ['token'],
      properties: {
        token: { type: 'string' },
      },
    },
  },
  handler: logoutUser,
}

const loginOpts = {
  schema: {
    body: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email' },
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
        id: { type: 'integer' },
        token: { type: 'string' },
      },
    },
  },
  handler: getToken,
}

const googleAuthOpts = {
  schema: {},
  handler: googleAuthHandler,
}

export { loginOpts, logoutOpts, tokenOpts, googleAuthOpts }