const friendRequest = async function(req, reply) {
  const userId = req.user.id
  const friendId = req.body.friendId

  if (!friendId) return reply.code(400).send({ error: "friend id is required" })
  
  if (userId === friendId) return reply.code(400).send({ error: "Cannot send friend request to yourself" })
  
  try {
    const getStatement = req.server.db.prepare('SELECT * FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)')
    const existing = getStatement.get(userId, friendId, friendId, userId)

    if (existing) return reply.code(400).send({ error: "Friend request already sent or users are already friends" })
    
      const insertStatement = req.server.db.prepare("INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'pending')")
      insertStatement.run(userId, friendId)

      return reply.send({ message: "Friend request sent successfully" })
  } catch (error) {
    return reply.code(500).send({ error: error.message })
  }
}

export default friendRequest