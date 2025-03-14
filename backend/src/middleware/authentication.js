const authenticate = async (req, reply) => {
  try {
    await req.server.jwtVerify()
  } catch (error) {
    return reply.code(403).send({ error: 'Unauthorized' })
  }
}