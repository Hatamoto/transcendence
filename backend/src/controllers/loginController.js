import { generateAccessToken, authenticateToken } from '../middleware/authentication.js'
import bcrypt from 'bcrypt'

const logoutUser = async function(req, reply) {
  const refreshToken = req.body.token

  const getStatement = req.server.db.prepare('SELECT user_id FROM refresh_tokens WHERE refresh_token = ?')
  const userId = getStatement.get(refreshToken)

  const deleteStatement = req.server.db.prepare('DELETE FROM refresh_tokens WHERE refresh_token = ?')
  deleteStatement.run(refreshToken)

  const updateStatement = req.server.db.prepare('UPDATE users SET status = 0 WHERE id = ?')
  updateStatement.run(userId)

  return reply.code(204).redirect('/')
}

const loginUser = async function (req, reply) {
  const { username, password } = req.body

  try {
    const getStatement = req.server.db.prepare('SELECT * FROM users WHERE name = ?')
    const user = getStatement.get(username)

    if (!user) {
      return reply.code(401).send({ error: 'Incorrect username or password' })
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return reply.code(401).send({ error: 'Incorrect username or password' })
    }
    const accessToken = generateAccessToken(req, { id: user.id, name: user.name })
    const refreshToken = req.server.jwt.sign({ id: user.id, name: user.name }, process.env.REFRESH_TOKEN_SECRET)

    const updateStatement = req.server.db.prepare('UPDATE users SET status = 1 WHERE name = ?')
    updateStatement.run(username)

    const insertStatement = req.server.db.prepare('INSERT INTO refresh_tokens (user_id, refresh_token) VALUES (?, ?)')
    insertStatement.run(user.id, refreshToken)

    return reply.send({ accessToken: accessToken, refreshToken: refreshToken })
  } catch (error) {
    return reply.code(500).send({ error: error.message })
  }
}

const getToken = async function(req, reply) {
  const refreshToken = req.body.token

  if (!refreshToken) return reply.code(401).send({ error: "No refresh token provided "})
  
  const getStatement = req.server.db.prepare('SELECT * FROM refresh_tokens WHERE refresh_token = ? AND user_id = ?')
  const token = getStatement.get(refreshToken, req.user.id)

  if (!token) return reply.code(403).send({ error: "Invalid refresh token" })

  try {
    const user = await req.server.jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = generateAccessToken(req, { id: user.id, name: user.name });
    
    return reply.send({ accessToken });
  } catch (error) {
    return reply.code(403).send({ error: "Invalid or expired refresh token" });
  }
}

export { loginUser, logoutUser, getToken }