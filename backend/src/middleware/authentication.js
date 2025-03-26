const authenticateToken = async (req, reply) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) return reply.code(401).send({ error: "No token provided" })

  try {
    const user = await req.server.jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = user;
  } catch (err) {
    return reply.code(403).send({ error: 'Unauthorized' });
  }
}

function generateAccessToken(req, user) {
  return req.server.jwt.sign(user, { expiresIn: '1h' })
}

export { authenticateToken, generateAccessToken }