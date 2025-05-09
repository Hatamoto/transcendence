import { 
  friendRequest, 
  checkPending, 
  acceptRequest,
  blockRequest,
  getFriends,
  declineRequest
} from '../controllers/friendController.js'
import authenticateToken from '../middleware/authentication.js'
import User from '../models/userModel.js'

const friendRequestOpts = {
  schema: {
    body: {
      type: 'object',
      properties: {
        friendId: {type: 'integer' },
      },
    },
  },
  preHandler: authenticateToken,
  handler: friendRequest,
}

const checkPendingOpts = {
  schema: {},
  preHandler: authenticateToken,
  handler: checkPending,
}

const acceptRequestOpts = {
  schema: {
    body: {
      type: 'object',
      properties: {
        friendId: {type: 'integer' },
      },
    },
  },
  preHandler: authenticateToken,
  handler: acceptRequest,
}

const blockRequestOpts = {
  schema: {
    body: {
      type: 'object',
      properties: {
        friendId: {type: 'integer' },
      },
    },
  },
  preHandler: authenticateToken,
  handler: blockRequest,
}

const getFriendsOpts = {
  schema: {
    response: {
      200: {
        type: 'array',
        items: User,
      },
    },
  },
  preHandler: authenticateToken,
  handler: getFriends,
}

const declineRequestOpts = {
  schema: {
    body: {
      type: 'object',
      properties: {
        friendId: {type: 'integer' },
      },
    },
  },
  preHandler: authenticateToken,
  handler: declineRequest,
}

export { 
  friendRequestOpts, 
  checkPendingOpts, 
  acceptRequestOpts, 
  blockRequestOpts,
  getFriendsOpts,
  declineRequestOpts
 }