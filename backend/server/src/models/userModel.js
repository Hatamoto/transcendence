const User = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    email: {type: 'string' },
    status: { type: 'integer' },
    wins: { type: 'integer' },
    losses: { type: 'integer' },
    avatar: { type: 'string' }
  },
}

export default User