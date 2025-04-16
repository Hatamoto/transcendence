const startTournament = async function(req, reply) {
  const { id, name } = req.body

  try{
    const insertStatement = req.server.db.prepare('INSERT INTO tournaments (name, created_by) VALUES (?, ?)')
    insertStatement.run(name, id)

    return reply.send({ message: "Tournament succesfully created" })
  } catch (error) {
    return reply.code(500).send({ error: error.message })
  }
}

const getTournaments = async function(req, reply) {
  try {
    const tournaments = req.server.db.prepare('SELECT * FROM tournaments WHERE is_active = 1')

    if (tournaments.length === 0) return reply.code(404).send({ error: "No tournaments found" })
    
    return reply.send(tournaments)
  } catch (error) {
    return reply.code(500).send({ error: error.message })
  }
}

const joinTournament = async function(req, reply) {
  const { userId, tournamentId } = req.body

  try {
    const user = req.server.db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
    if (!user) return reply.code(404).send({ error: "user not found" })
    
    const tournament = req.server.db.prepare('SELECT * FROM tournaments WHERE id = ?').get(tournamentId)
    if (!tournament) return reply.code(404).send({ error: "tournament not found" })
    
    const insertStatement = req.server.db.prepare('INSERT INTO tournament_players (user_id, tournament_id) VALUES(?, ?)')
    insertStatement.run(userId, tournamentId)

    return reply.send({ message: `User ${user.name} successfully joined tournament ${tournament.name}` })
  } catch (error) {
    return reply.code(500).send({ error: error.message })
  }
}

export { startTournament, getTournaments, joinTournament }