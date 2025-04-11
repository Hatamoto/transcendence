const friendRequest = async function(req, reply) {
  const userId = req.user.id
  const friendId = req.body.friendId

  if (!friendId) return reply.code(400).send({ error: "friend id is required" })
  
  if (userId === friendId) return reply.code(400).send({ error: "Cannot send friend request to yourself" })
  
  try {
    const getStatement = req.server.db
      .prepare('SELECT * FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)')
    const existing = getStatement.get(userId, friendId, friendId, userId)

    if (existing) {
      if (existing.status = 'pending') return reply.code(400).send({ error: "Friend request already sent" })
      else if (existing.status = 'accepted') return reply.code(400).send({ error: "Users are already friends" })
      else if (existing.status = 'blocked') return reply.code(400).send({ error: "User is blocked" })
    }
    
    const insertStatement = req.server.db.prepare("INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)")
    insertStatement.run(userId, friendId, 'pending')

    return reply.send({ message: "Friend request sent successfully" })
  } catch (error) {
    return reply.code(500).send({ error: error.message })
  }
}

const checkPending = async function(req, reply) {
  try {
    const friendRequests = req.server.db
    .prepare('SELECT user_id FROM friends WHERE friend_id = ? AND status = ?')
    .all(req.user.id, 'pending')
    
    if (friendRequests.length === 0) return reply.code(204).send()
    
    return reply.send({
      request_count: friendRequests.length,
      data: friendRequests
    })
  } catch (error) {
    console.error('Database error:', error)
    return reply.code(500).send({ error: error.message })
  }
}

const acceptRequest = async function(req, reply) {
  const userId = req.user.id
  const friendId = req.body.friendId

  if (!friendId) return reply.code(400).send({ error: "friend id is required" })

  try{
    const request = req.server.db
      .prepare('SELECT * FROM friends WHERE user_id = ? AND friend_id = ?')
      .get(friendId, userId)
    if (!request) return reply.code(404).send({ error: `No friend requests found from user: ${friendId}` })

    const putStatement = req.server.db.prepare('UPDATE friends SET status = ? WHERE user_id = ? AND friend_id = ?')
    putStatement.run('accepted', friendId, userId)

    return reply.send(`Friend request from user ${friendId} was accepted`)
  } catch (error) {
    console.error('Database error:', error)
    return reply.code(500).send({ error: error.message })
  }
}

const blockRequest = async function(req, reply) {
  const userId = req.user.id
  const friendId = req.body.friendId

  if (!friendId) return reply.code(400).send({ error: "friend id is required" })

  try{
    const request = req.server.db
      .prepare('SELECT * FROM friends WHERE user_id = ? AND friend_id = ?')
      .get(friendId, userId)
    if (!request) return reply.code(404).send({ error: `No friend requests found from user: ${friendId}` })

    const putStatement = req.server.db.prepare('UPDATE friends SET status = ? WHERE user_id = ? AND friend_id = ?')
    putStatement.run('blocked', friendId, userId)

    return reply.send(`Friend request from user ${friendId} was blocked`)
  } catch (error) {
    console.error('Database error:', error)
    return reply.code(500).send({ error: error.message })
  }
}

const getFriends = async function(req, reply) {
  try {
    const friends = req.server.db
      .prepare('SELECT friend_id FROM friends WHERE user_id = ? AND status = ?')
      .all(req.user.id, 'accepted')

    if (friends.length === 0) return reply.code(204).send()
    
    return reply.send(friends)
  } catch (error) {
    console.error('Database error:', error)
    return reply.code(500).send({ error: error.message })
  }
}

export { 
  friendRequest, 
  checkPending, 
  acceptRequest, 
  blockRequest, 
  getFriends
 }