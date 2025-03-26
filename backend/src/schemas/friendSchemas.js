import friendRequest from '../controllers/friendController.js'
import { authenticateToken } from '../middleware/authentication.js'

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

export default friendRequestOpts