const createTournament = async function(req, reply) {
  const { id, name, size } = req.body

  try{
    const tournaments = req.server.db
      .prepare('SELECT * FROM tournaments WHERE created_by = ?')
      .get(id)
    
    if (tournaments.length !== 0) {
      tournaments.forEach(item => {
        if (item.status !== 'completed') {
          return reply.code(409).send({ 
            error: "User already has an active tournament started",
            status: item.status
          })
        }
      })
    }
    const insertStatement = req.server.db.prepare('INSERT INTO tournaments (name, created_by, size) VALUES (?, ?, ?)')
    insertStatement.run(name, id, size)

    return reply.send({ message: "Tournament successfully created" })
  } catch (error) {
    return reply.code(500).send({ error: error.message })
  }
}

const getTournaments = async function(req, reply) {
  try {
    const tournaments = req.server.db
      .prepare('SELECT * FROM tournaments WHERE status = ?')
      .get('created')

    if (tournaments.length === 0) return reply.code(404).send({ error: "No tournaments found" })
    
    return reply.send(tournaments)
  } catch (error) {
    return reply.code(500).send({ error: error.message })
  }
}

const joinTournament = async function(req, reply) {
  const { userId, tournamentId } = req.body

  try {
    const user = req.server.db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(userId)

    if (!user) return reply.code(404).send({ error: "user not found" })
    
    const tournament = req.server.db
      .prepare('SELECT * FROM tournaments WHERE id = ?')
      .get(tournamentId)
    
    if (!tournament) return reply.code(404).send({ error: "tournament not found" })
    else if (tournament.status !== 'created') return reply.code(409).send({ 
      error: "Unable to join tournament",
      status: tournament.status
    })
    
    const insertStatement = req.server.db.prepare('INSERT INTO tournament_players (user_id, tournament_id) VALUES(?, ?)')
    insertStatement.run(userId, tournamentId)

    const players = req.server.db
      .prepare('SELECT user_id FROM tournament_players WHERE tournament_id = ?')
      .get(tournament.id)

    if (players.length == tournament.size) {
      const updateStatement = req.server.db.prepare('UPDATE tournaments SET status = ? WHERE id = ?')
      updateStatement.run('in_progress', tournament.id)
      
      
    }
    return reply.send({ message: `User ${user.name} successfully joined tournament ${tournament.name}` })
  } catch (error) {
    return reply.code(500).send({ error: error.message })
  }
}

const setReady = async function(req, reply) {
  const { tournamentId } = req.params

  try {
    const tournament = req.server.db
      .prepare('SELECT * FROM tournaments WHERE id = ?')
      .get(tournamentId)
    if (!tournament) return reply.code(404).send({ error: `No tournament found with id ${tournamentId}` })
    
    const player = req.server.db
      .prepare('SELECT * FROM tournament_players WHERE tournament_id = ? AND user_id = ?')
      .get(tournamentId, req.user.id)
    if (!player) return reply.code(404).send({ error: `Player not found in tournament ${tournamentId}` })

    const updateStatement = req.server.db.prepare('UPDATE tournament_players SET is_ready = 1 WHERE tournament_id = ? AND user_id = ?')
    updateStatement.run(tournamentId, player.id)

    return reply.send({ message: `User ${player.id} is now ready` })
  } catch (error) {
    return reply.code(500).send({ error: error.message })
  }
}

export { createTournament, getTournaments, joinTournament, setReady }