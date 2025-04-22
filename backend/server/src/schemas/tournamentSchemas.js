import { 
  createTournament,
  getTournaments,
  joinTournament,
  setReady
} from '../controllers/tournamentController.js'
import Tournament from '../models/tournamentModel.js'
import authenticateToken from '../middleware/authentication.js'

const createTournamentOpts = {
  schema: {
    body: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        size: {type: 'integer' },
      },
    },
  },
  preHandler: authenticateToken,
  handler: createTournament,
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

const setReadyOpts = {
  schema: {
    params: {
      type: 'object',
      properties: {
        tournamentId: { type: 'integer', minimum: 1 },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  preHandler: authenticateToken,
  handler: setReady,
}

export { 
  createTournamentOpts,
  getTournamentsOpts,
  joinTournamentOpts,
  setReadyOpts
}