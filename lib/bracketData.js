// 2026 NCAA Tournament Bracket Data
// Picks lock: Thursday March 19, 2026 at 12:00 PM ET (tip-off)

export const LOCK_TIME = new Date('2026-03-19T12:00:00-05:00')

export function isBracketLocked() {
  return new Date() >= LOCK_TIME
}

export const REGIONS = ['East', 'West', 'Midwest', 'South']

export const REGION_COLORS = {
  East: '#FF6B35',
  West: '#E8703A',
  Midwest: '#D4581F',
  South: '#C04010',
}

export const ROUND_POINTS = {
  R1: 1,
  R2: 2,
  R3: 4,
  R4: 8,
  FF: 16,
  CHAMP: 32,
}

export const ROUND_NAMES = {
  R1: 'Round of 64',
  R2: 'Round of 32',
  R3: 'Sweet 16',
  R4: 'Elite 8',
  FF: 'Final Four',
  CHAMP: 'Championship',
}

export const BRACKET_DATA = {
  East: [
    { id: 'E_R1_1', teams: [{ seed: 1, name: 'Duke' }, { seed: 16, name: 'Siena' }] },
    { id: 'E_R1_2', teams: [{ seed: 8, name: 'Ohio State' }, { seed: 9, name: 'TCU' }] },
    { id: 'E_R1_3', teams: [{ seed: 5, name: "St. John's" }, { seed: 12, name: 'Northern Iowa' }] },
    { id: 'E_R1_4', teams: [{ seed: 4, name: 'Kansas' }, { seed: 13, name: 'Cal Baptist' }] },
    { id: 'E_R1_5', teams: [{ seed: 6, name: 'Louisville' }, { seed: 11, name: 'South Florida' }] },
    { id: 'E_R1_6', teams: [{ seed: 3, name: 'Michigan State' }, { seed: 14, name: 'N. Dakota St.' }] },
    { id: 'E_R1_7', teams: [{ seed: 7, name: 'UCLA' }, { seed: 10, name: 'UCF' }] },
    { id: 'E_R1_8', teams: [{ seed: 2, name: 'UConn' }, { seed: 15, name: 'Furman' }] },
  ],
  West: [
    { id: 'W_R1_1', teams: [{ seed: 1, name: 'Arizona' }, { seed: 16, name: 'Howard' }] },
    { id: 'W_R1_2', teams: [{ seed: 8, name: 'Clemson' }, { seed: 9, name: 'Iowa' }] },
    { id: 'W_R1_3', teams: [{ seed: 5, name: 'Wisconsin' }, { seed: 12, name: 'McNeese' }] },
    { id: 'W_R1_4', teams: [{ seed: 4, name: 'Arkansas' }, { seed: 13, name: 'Hofstra' }] },
    { id: 'W_R1_5', teams: [{ seed: 6, name: 'BYU' }, { seed: 11, name: 'VCU' }] },
    { id: 'W_R1_6', teams: [{ seed: 3, name: 'Gonzaga' }, { seed: 14, name: 'Kennesaw St.' }] },
    { id: 'W_R1_7', teams: [{ seed: 7, name: "St. Mary's" }, { seed: 10, name: 'Villanova' }] },
    { id: 'W_R1_8', teams: [{ seed: 2, name: 'Purdue' }, { seed: 15, name: 'Penn' }] },
  ],
  Midwest: [
    { id: 'M_R1_1', teams: [{ seed: 1, name: 'Michigan' }, { seed: 16, name: 'LIU' }] },
    { id: 'M_R1_2', teams: [{ seed: 8, name: 'Georgia' }, { seed: 9, name: 'Saint Louis' }] },
    { id: 'M_R1_3', teams: [{ seed: 5, name: 'Texas Tech' }, { seed: 12, name: 'High Point' }] },
    { id: 'M_R1_4', teams: [{ seed: 4, name: 'Alabama' }, { seed: 13, name: 'N. Dakota St.' }] },
    { id: 'M_R1_5', teams: [{ seed: 6, name: 'Tennessee' }, { seed: 11, name: 'Missouri' }] },
    { id: 'M_R1_6', teams: [{ seed: 3, name: 'Virginia' }, { seed: 14, name: 'Tennessee St.' }] },
    { id: 'M_R1_7', teams: [{ seed: 7, name: 'Kentucky' }, { seed: 10, name: 'NC State' }] },
    { id: 'M_R1_8', teams: [{ seed: 2, name: 'Iowa State' }, { seed: 15, name: 'Queens' }] },
  ],
  South: [
    { id: 'S_R1_1', teams: [{ seed: 1, name: 'Florida' }, { seed: 16, name: 'Prairie View' }] },
    { id: 'S_R1_2', teams: [{ seed: 8, name: 'Utah State' }, { seed: 9, name: 'Boise State' }] },
    { id: 'S_R1_3', teams: [{ seed: 5, name: 'North Carolina' }, { seed: 12, name: 'Akron' }] },
    { id: 'S_R1_4', teams: [{ seed: 4, name: 'Vanderbilt' }, { seed: 13, name: 'Hofstra' }] },
    { id: 'S_R1_5', teams: [{ seed: 6, name: 'Illinois' }, { seed: 11, name: 'Miami (OH)' }] },
    { id: 'S_R1_6', teams: [{ seed: 3, name: 'Nebraska' }, { seed: 14, name: 'Louisiana Tech' }] },
    { id: 'S_R1_7', teams: [{ seed: 7, name: 'Miami FL' }, { seed: 10, name: 'Dayton' }] },
    { id: 'S_R1_8', teams: [{ seed: 2, name: 'Houston' }, { seed: 15, name: 'UMBC' }] },
  ],
}

export function buildEmptyPicks() {
  const picks = {}
  REGIONS.forEach((region) => {
    const rc = region[0]
    BRACKET_DATA[region].forEach((game) => { picks[game.id] = null })
    for (let i = 1; i <= 4; i++) picks[`${rc}_R2_${i}`] = null
    for (let i = 1; i <= 2; i++) picks[`${rc}_R3_${i}`] = null
    picks[`${rc}_R4`] = null
  })
  picks['FF_1'] = null
  picks['FF_2'] = null
  picks['CHAMP'] = null
  return picks
}

export function getRegionRounds(region, picks) {
  const rc = region[0]
  const r1 = BRACKET_DATA[region]
  const r2 = [
    { id: `${rc}_R2_1`, round: 'R2', teams: [picks[r1[0].id], picks[r1[1].id]] },
    { id: `${rc}_R2_2`, round: 'R2', teams: [picks[r1[2].id], picks[r1[3].id]] },
    { id: `${rc}_R2_3`, round: 'R2', teams: [picks[r1[4].id], picks[r1[5].id]] },
    { id: `${rc}_R2_4`, round: 'R2', teams: [picks[r1[6].id], picks[r1[7].id]] },
  ]
  const r3 = [
    { id: `${rc}_R3_1`, round: 'R3', teams: [picks[r2[0].id], picks[r2[1].id]] },
    { id: `${rc}_R3_2`, round: 'R3', teams: [picks[r2[2].id], picks[r2[3].id]] },
  ]
  const r4 = { id: `${rc}_R4`, round: 'R4', teams: [picks[r3[0].id], picks[r3[1].id]] }
  return { r1, r2, r3, r4, winner: picks[r4.id] }
}

// Get all teams a user picked to win in each round
export function getAllPickedTeams(picks) {
  const teams = new Set()
  Object.values(picks || {}).forEach(t => { if (t) teams.add(t) })
  return teams
}

// Calculate scores given picks and actual results
// results = { [gameId]: winningTeam }
export function calculateScores(picks, results) {
  if (!picks || !results) return { total: 0, byRound: {}, maxPossible: 0, maxByRound: {} }

  const roundMap = buildRoundMap(picks)
  const byRound = { R1: 0, R2: 0, R3: 0, R4: 0, FF: 0, CHAMP: 0 }
  const maxByRound = { R1: 0, R2: 0, R3: 0, R4: 0, FF: 0, CHAMP: 0 }

  // Eliminated teams (lost a game)
  const eliminated = new Set()
  Object.entries(results).forEach(([gameId, winner]) => {
    const game = roundMap[gameId]
    if (game) {
      game.teams.forEach(t => { if (t && t !== winner) eliminated.add(t) })
    }
  })

  Object.entries(roundMap).forEach(([gameId, game]) => {
    const { round, teams } = game
    const pts = ROUND_POINTS[round]
    const result = results[gameId]

    teams.forEach(team => {
      if (!team) return
      const picked = picks[gameId] === team

      if (result) {
        // Game is finished
        if (result === team && picked) {
          byRound[round] = (byRound[round] || 0) + pts
        }
        // Max possible: if game finished, only winner can score
        if (result === team && picked) {
          maxByRound[round] = (maxByRound[round] || 0) + pts
        }
      } else {
        // Game not yet played — can this pick still happen?
        if (picked && !eliminated.has(team)) {
          maxByRound[round] = (maxByRound[round] || 0) + pts
        }
      }
    })
  })

  const total = Object.values(byRound).reduce((a, b) => a + b, 0)
  const maxPossible = total + Object.values(maxByRound).reduce((a, b) => a + b, 0) - total

  // Recalculate maxPossible properly
  let mp = 0
  Object.entries(roundMap).forEach(([gameId, game]) => {
    const { round, teams } = game
    const pts = ROUND_POINTS[round]
    const result = results[gameId]
    const myPick = picks[gameId]
    if (!myPick) return
    if (result) {
      if (result === myPick) mp += pts
    } else {
      if (!eliminated.has(myPick)) mp += pts
    }
  })

  return { total, byRound, maxPossible: mp, maxByRound }
}

// Build a map of gameId -> { round, teams }
export function buildRoundMap(picks) {
  const map = {}

  REGIONS.forEach(region => {
    const rc = region[0]
    const r1 = BRACKET_DATA[region]

    r1.forEach(game => {
      map[game.id] = { round: 'R1', teams: game.teams.map(t => t.name) }
    })

    const r2ids = [`${rc}_R2_1`, `${rc}_R2_2`, `${rc}_R2_3`, `${rc}_R2_4`]
    r2ids.forEach((id, i) => {
      map[id] = { round: 'R2', teams: [picks[r1[i * 2].id], picks[r1[i * 2 + 1].id]] }
    })

    map[`${rc}_R3_1`] = { round: 'R3', teams: [picks[r2ids[0]], picks[r2ids[1]]] }
    map[`${rc}_R3_2`] = { round: 'R3', teams: [picks[r2ids[2]], picks[r2ids[3]]] }
    map[`${rc}_R4`] = { round: 'R4', teams: [picks[`${rc}_R3_1`], picks[`${rc}_R3_2`]] }
  })

  map['FF_1'] = { round: 'FF', teams: [picks['E_R4'], picks['S_R4']] }
  map['FF_2'] = { round: 'FF', teams: [picks['W_R4'], picks['M_R4']] }
  map['CHAMP'] = { round: 'CHAMP', teams: [picks['FF_1'], picks['FF_2']] }

  return map
}

// Get eliminated teams based on results
export function getEliminatedTeams(results, picks) {
  const eliminated = new Set()
  if (!results) return eliminated
  const roundMap = buildRoundMap(picks || {})
  Object.entries(results).forEach(([gameId, winner]) => {
    const game = roundMap[gameId]
    if (game) {
      game.teams.forEach(t => { if (t && t !== winner) eliminated.add(t) })
    }
  })
  return eliminated
}
