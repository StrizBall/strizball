// 2026 NCAA Tournament Bracket Data
// Updated: March 18, 2026 — All play-in results included
// Play-in winners: Howard (beat UMBC), Texas (beat NC State)
// Still TBD: SMU/Miami (OH), Prairie View/Lehigh

export const LOCK_TIME = new Date('2026-03-19T12:15:00-04:00') // 12:15 PM ET = 10:15 AM MT tip-off

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
    { id: 'E_R1_3', teams: [{ seed: 5, name: "St. John\'s" }, { seed: 12, name: 'Northern Iowa' }] },
    { id: 'E_R1_4', teams: [{ seed: 4, name: 'Kansas' }, { seed: 13, name: 'Cal Baptist' }] },
    { id: 'E_R1_5', teams: [{ seed: 6, name: 'Louisville' }, { seed: 11, name: 'South Florida' }] },
    { id: 'E_R1_6', teams: [{ seed: 3, name: 'Michigan State' }, { seed: 14, name: 'N. Dakota State' }] },
    { id: 'E_R1_7', teams: [{ seed: 7, name: 'UCLA' }, { seed: 10, name: 'UCF' }] },
    { id: 'E_R1_8', teams: [{ seed: 2, name: 'UConn' }, { seed: 15, name: 'Furman' }] },
  ],
  West: [
    { id: 'W_R1_1', teams: [{ seed: 1, name: 'Arizona' }, { seed: 16, name: 'LIU' }] },
    { id: 'W_R1_2', teams: [{ seed: 8, name: 'Villanova' }, { seed: 9, name: 'Utah State' }] },
    { id: 'W_R1_3', teams: [{ seed: 5, name: 'Wisconsin' }, { seed: 12, name: 'High Point' }] },
    { id: 'W_R1_4', teams: [{ seed: 4, name: 'Arkansas' }, { seed: 13, name: "Hawai\'i" }] },
    { id: 'W_R1_5', teams: [{ seed: 6, name: 'BYU' }, { seed: 11, name: 'Texas' }] },
    { id: 'W_R1_6', teams: [{ seed: 3, name: 'Gonzaga' }, { seed: 14, name: 'Kennesaw State' }] },
    { id: 'W_R1_7', teams: [{ seed: 7, name: 'Miami FL' }, { seed: 10, name: 'Missouri' }] },
    { id: 'W_R1_8', teams: [{ seed: 2, name: 'Purdue' }, { seed: 15, name: 'Queens' }] },
  ],
  Midwest: [
    { id: 'M_R1_1', teams: [{ seed: 1, name: 'Michigan' }, { seed: 16, name: 'Howard' }] },
    { id: 'M_R1_2', teams: [{ seed: 8, name: 'Georgia' }, { seed: 9, name: 'Saint Louis' }] },
    { id: 'M_R1_3', teams: [{ seed: 5, name: 'Texas Tech' }, { seed: 12, name: 'Akron' }] },
    { id: 'M_R1_4', teams: [{ seed: 4, name: 'Alabama' }, { seed: 13, name: 'Hofstra' }] },
    { id: 'M_R1_5', teams: [{ seed: 6, name: 'Tennessee' }, { seed: 11, name: 'SMU/Miami (OH)' }] },
    { id: 'M_R1_6', teams: [{ seed: 3, name: 'Virginia' }, { seed: 14, name: 'Wright State' }] },
    { id: 'M_R1_7', teams: [{ seed: 7, name: 'Kentucky' }, { seed: 10, name: 'Santa Clara' }] },
    { id: 'M_R1_8', teams: [{ seed: 2, name: 'Iowa State' }, { seed: 15, name: 'Tennessee State' }] },
  ],
  South: [
    { id: 'S_R1_1', teams: [{ seed: 1, name: 'Florida' }, { seed: 16, name: 'Prairie View/Lehigh' }] },
    { id: 'S_R1_2', teams: [{ seed: 8, name: 'Clemson' }, { seed: 9, name: 'Iowa' }] },
    { id: 'S_R1_3', teams: [{ seed: 5, name: 'Vanderbilt' }, { seed: 12, name: 'McNeese State' }] },
    { id: 'S_R1_4', teams: [{ seed: 4, name: 'Nebraska' }, { seed: 13, name: 'Troy' }] },
    { id: 'S_R1_5', teams: [{ seed: 6, name: 'North Carolina' }, { seed: 11, name: 'VCU' }] },
    { id: 'S_R1_6', teams: [{ seed: 3, name: 'Illinois' }, { seed: 14, name: 'Penn' }] },
    { id: 'S_R1_7', teams: [{ seed: 7, name: "St. Mary\'s" }, { seed: 10, name: 'Texas A&M' }] },
    { id: 'S_R1_8', teams: [{ seed: 2, name: 'Houston' }, { seed: 15, name: 'Idaho' }] },
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

export function getAllPickedTeams(picks) {
  const teams = new Set()
  Object.values(picks || {}).forEach(t => { if (t) teams.add(t) })
  return teams
}

export function calculateScores(picks, results) {
  if (!picks || !results) return { total: 0, byRound: {}, maxPossible: 0 }
  const roundMap = buildRoundMap(picks)
  const byRound = { R1: 0, R2: 0, R3: 0, R4: 0, FF: 0, CHAMP: 0 }
  const eliminated = getEliminatedTeams(results, picks)
  let mp = 0
  Object.entries(roundMap).forEach(([gameId, game]) => {
    const { round, teams } = game
    const pts = ROUND_POINTS[round]
    const result = results[gameId]
    const myPick = picks[gameId]
    if (!myPick) return
    if (result) {
      if (result === myPick) {
        byRound[round] = (byRound[round] || 0) + pts
        mp += pts
      }
    } else {
      if (!eliminated.has(myPick)) mp += pts
    }
  })
  const total = Object.values(byRound).reduce((a, b) => a + b, 0)
  return { total, byRound, maxPossible: mp }
}

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
