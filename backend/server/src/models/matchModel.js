const Match = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    tournament_id: {type: 'integer'},
    round: { type: 'integer' },
    match_number: { type: 'integer' },
    player_one_id: { type: 'integer' },
    player_two_id: { type: 'integer' },
    winner_id: { type: 'integer' },
    status: { type: 'string' },
  },
}

export default Match