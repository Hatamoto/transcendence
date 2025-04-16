import { startTournament, getTournaments, joinTournament } from '../controllers/tournamentController.js'
import Tournament from '../models/tournamentModel.js'

const startTournamentOpts = {
  schema: {
    body: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' }
      },
    },
  },
  preHandler: authenticateToken,
  handler: startTournament,
}

const getTournamentsOpts = {
  schema: {
    response: {
      200: {
        type: 'array',
        items: Tournament,
      },
    },
  },
  handler: getTournaments,
}

const joinTournamentOpts = {
  schema: {
    body: {
      type: 'object',
      required: ['userId', 'tournamentId'],
      properties: {
        userId: { type: 'integer' },
        tournamentId: { type: 'integer' }
      },
    },
  },
  preHandler: authenticateToken,
  handler: joinTournament,
}

export { startTournamentOpts, getTournamentsOpts, joinTournamentOpts }