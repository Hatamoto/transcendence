const authenticate = async (req, reply) => {
  try {
    await req.server.jwtVerify()
  } catch (error) {
    return reply.code(403).send({ error: 'Unauthorized' })
  }
}

const authenticateToken = async (req, reply, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token === null) return reply.code(401)

  req.server.jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return reply.code(403).send({ error: 'Unauthorized' })
    req.user = user
  next()
  })
}

export default authenticateToken