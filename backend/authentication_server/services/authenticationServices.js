import { OAuth2Client } from 'google-auth-library'
const client = new OAuth2Client(process.env.CLIENT_ID);

function generateAccessToken(req, user) {
  return req.server.jwt.sign(user, { expiresIn: '1h' })
}

async function verifyIdToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.CLIENT_ID, 
  })

  const payload = ticket.getPayload()

  if (!payload.email_verified) {
    throw new Error('Email is not verified by Google');
  }

  return payload
}

const completeLogin = async function(req, reply, user) {
  try {
    const accessToken = generateAccessToken(req, { id: user.id, name: user.name })
    const refreshToken = req.server.jwt.sign({ id: user.id, name: user.name }, process.env.REFRESH_TOKEN_SECRET)
  
    const updateStatement = req.server.db.prepare('UPDATE users SET status = 1 WHERE name = ?')
    updateStatement.run(user.name)
  
    const insertStatement = req.server.db.prepare('INSERT INTO refresh_tokens (user_id, refresh_token) VALUES (?, ?)')
    insertStatement.run(user.id, refreshToken)
  
    return reply.send({ userId: user.id, accessToken: accessToken, refreshToken: refreshToken })
  } catch (error) {
    console.log(error)
    return reply.code(500).send({ error: error.message})
  }
}

export { completeLogin, verifyIdToken }