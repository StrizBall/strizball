// pages/api/sync-results.js
// Automatically fetches NCAA tournament results from ESPN
// and maps them to our bracket game IDs in Supabase.
// Called every 5 minutes via a Vercel cron job.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // needs service role to write
)

// Map ESPN team names / abbreviations to our bracket team names
// Add more aliases here if ESPN uses different names
const TEAM_ALIASES = {
  // East
  'Duke Blue Devils': 'Duke',
  'Duke': 'Duke',
  'Ohio State Buckeyes': 'Ohio State',
  'Ohio State': 'Ohio State',
  'TCU Horned Frogs': 'TCU',
  'TCU': 'TCU',
  "St. John's Red Storm": "St. John's",
  "Saint John's": "St. John's",
  'Northern Iowa Panthers': 'Northern Iowa',
  'Northern Iowa': 'Northern Iowa',
  'Kansas Jayhawks': 'Kansas',
  'Kansas': 'Kansas',
  'Cal Baptist Lancers': 'Cal Baptist',
  'California Baptist': 'Cal Baptist',
  'Louisville Cardinals': 'Louisville',
  'Louisville': 'Louisville',
  'South Florida Bulls': 'South Florida',
  'USF': 'South Florida',
  'Michigan State Spartans': 'Michigan State',
  'Michigan State': 'Michigan State',
  'North Dakota State Bison': 'N. Dakota St.',
  'NDSU': 'N. Dakota St.',
  'UCLA Bruins': 'UCLA',
  'UCLA': 'UCLA',
  'UCF Knights': 'UCF',
  'UCF': 'UCF',
  'Connecticut Huskies': 'UConn',
  'UConn': 'UConn',
  'Furman Paladins': 'Furman',
  'Furman': 'Furman',
  'Siena Saints': 'Siena',
  'Siena': 'Siena',

  // West
  'Arizona Wildcats': 'Arizona',
  'Arizona': 'Arizona',
  'Howard Bison': 'Howard',
  'Howard': 'Howard',
  'Clemson Tigers': 'Clemson',
  'Clemson': 'Clemson',
  'Iowa Hawkeyes': 'Iowa',
  'Iowa': 'Iowa',
  'Wisconsin Badgers': 'Wisconsin',
  'Wisconsin': 'Wisconsin',
  'McNeese Cowboys': 'McNeese',
  'McNeese State': 'McNeese',
  'Arkansas Razorbacks': 'Arkansas',
  'Arkansas': 'Arkansas',
  'Hofstra Pride': 'Hofstra',
  'Hofstra': 'Hofstra',
  'BYU Cougars': 'BYU',
  'BYU': 'BYU',
  'VCU Rams': 'VCU',
  'VCU': 'VCU',
  'Gonzaga Bulldogs': 'Gonzaga',
  'Gonzaga': 'Gonzaga',
  'Kennesaw State Owls': 'Kennesaw St.',
  'Kennesaw State': 'Kennesaw St.',
  "Saint Mary's Gaels": "St. Mary's",
  "St. Mary's": "St. Mary's",
  'Villanova Wildcats': 'Villanova',
  'Villanova': 'Villanova',
  'Purdue Boilermakers': 'Purdue',
  'Purdue': 'Purdue',
  'Pennsylvania Quakers': 'Penn',
  'Penn': 'Penn',

  // Midwest
  'Michigan Wolverines': 'Michigan',
  'Michigan': 'Michigan',
  'LIU Sharks': 'LIU',
  'LIU': 'LIU',
  'Georgia Bulldogs': 'Georgia',
  'Georgia': 'Georgia',
  'Saint Louis Billikens': 'Saint Louis',
  'Saint Louis': 'Saint Louis',
  'Texas Tech Red Raiders': 'Texas Tech',
  'Texas Tech': 'Texas Tech',
  'High Point Panthers': 'High Point',
  'High Point': 'High Point',
  'Alabama Crimson Tide': 'Alabama',
  'Alabama': 'Alabama',
  'Tennessee Volunteers': 'Tennessee',
  'Tennessee': 'Tennessee',
  'Missouri Tigers': 'Missouri',
  'Missouri': 'Missouri',
  'Virginia Cavaliers': 'Virginia',
  'Virginia': 'Virginia',
  'Tennessee State Tigers': 'Tennessee St.',
  'Tennessee State': 'Tennessee St.',
  'Kentucky Wildcats': 'Kentucky',
  'Kentucky': 'Kentucky',
  'NC State Wolfpack': 'NC State',
  'NC State': 'NC State',
  'Iowa State Cyclones': 'Iowa State',
  'Iowa State': 'Iowa State',
  'Queens Royals': 'Queens',
  'Queens': 'Queens',

  // South
  'Florida Gators': 'Florida',
  'Florida': 'Florida',
  'Prairie View A&M Panthers': 'Prairie View',
  'Prairie View': 'Prairie View',
  'Utah State Aggies': 'Utah State',
  'Utah State': 'Utah State',
  'Boise State Broncos': 'Boise State',
  'Boise State': 'Boise State',
  'North Carolina Tar Heels': 'North Carolina',
  'North Carolina': 'North Carolina',
  'Akron Zips': 'Akron',
  'Akron': 'Akron',
  'Vanderbilt Commodores': 'Vanderbilt',
  'Vanderbilt': 'Vanderbilt',
  'Illinois Fighting Illini': 'Illinois',
  'Illinois': 'Illinois',
  'Miami (OH) RedHawks': 'Miami (OH)',
  'Miami Ohio': 'Miami (OH)',
  'Nebraska Cornhuskers': 'Nebraska',
  'Nebraska': 'Nebraska',
  'Louisiana Tech Bulldogs': 'Louisiana Tech',
  'Louisiana Tech': 'Louisiana Tech',
  'Miami Hurricanes': 'Miami FL',
  'Miami FL': 'Miami FL',
  'Miami (FL)': 'Miami FL',
  'Dayton Flyers': 'Dayton',
  'Dayton': 'Dayton',
  'Houston Cougars': 'Houston',
  'Houston': 'Houston',
  'UMBC Retrievers': 'UMBC',
  'UMBC': 'UMBC',
}

function normalizeTeam(name) {
  if (!name) return null
  return TEAM_ALIASES[name] || TEAM_ALIASES[name.trim()] || name
}

// Our bracket R1 matchups — used to identify which ESPN game = which bracket game
const BRACKET_MATCHUPS = {
  // East
  'E_R1_1': ['Duke', 'Siena'],
  'E_R1_2': ['Ohio State', 'TCU'],
  'E_R1_3': ["St. John's", 'Northern Iowa'],
  'E_R1_4': ['Kansas', 'Cal Baptist'],
  'E_R1_5': ['Louisville', 'South Florida'],
  'E_R1_6': ['Michigan State', 'N. Dakota St.'],
  'E_R1_7': ['UCLA', 'UCF'],
  'E_R1_8': ['UConn', 'Furman'],
  // West
  'W_R1_1': ['Arizona', 'Howard'],
  'W_R1_2': ['Clemson', 'Iowa'],
  'W_R1_3': ['Wisconsin', 'McNeese'],
  'W_R1_4': ['Arkansas', 'Hofstra'],
  'W_R1_5': ['BYU', 'VCU'],
  'W_R1_6': ['Gonzaga', 'Kennesaw St.'],
  'W_R1_7': ["St. Mary's", 'Villanova'],
  'W_R1_8': ['Purdue', 'Penn'],
  // Midwest
  'M_R1_1': ['Michigan', 'LIU'],
  'M_R1_2': ['Georgia', 'Saint Louis'],
  'M_R1_3': ['Texas Tech', 'High Point'],
  'M_R1_4': ['Alabama', 'N. Dakota St.'],
  'M_R1_5': ['Tennessee', 'Missouri'],
  'M_R1_6': ['Virginia', 'Tennessee St.'],
  'M_R1_7': ['Kentucky', 'NC State'],
  'M_R1_8': ['Iowa State', 'Queens'],
  // South
  'S_R1_1': ['Florida', 'Prairie View'],
  'S_R1_2': ['Utah State', 'Boise State'],
  'S_R1_3': ['North Carolina', 'Akron'],
  'S_R1_4': ['Vanderbilt', 'Hofstra'],
  'S_R1_5': ['Illinois', 'Miami (OH)'],
  'S_R1_6': ['Nebraska', 'Louisiana Tech'],
  'S_R1_7': ['Miami FL', 'Dayton'],
  'S_R1_8': ['Houston', 'UMBC'],
}

function findGameId(team1, team2) {
  const t1 = normalizeTeam(team1)
  const t2 = normalizeTeam(team2)
  for (const [gameId, teams] of Object.entries(BRACKET_MATCHUPS)) {
    if (
      (teams.includes(t1) && teams.includes(t2)) ||
      (teams[0] === t1 || teams[1] === t1 || teams[0] === t2 || teams[1] === t2)
    ) {
      return { gameId, winner: null }
    }
  }
  return null
}

export default async function handler(req, res) {
  // Allow GET for cron, POST for manual trigger
  try {
    // Fetch NCAA tournament games from ESPN
    const espnUrl = 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=100'
    const response = await fetch(espnUrl)
    const data = await response.json()

    const updates = []
    const skipped = []

    if (!data.events || data.events.length === 0) {
      return res.status(200).json({ message: 'No games found', updates: [] })
    }

    for (const event of data.events) {
      const statusName = event.status?.type?.name
      // Only process completed games
      if (statusName !== 'STATUS_FINAL') {
        skipped.push({ name: event.name, status: statusName })
        continue
      }

      const comp = event.competitions?.[0]
      if (!comp) continue

      const competitors = comp.competitors || []
      if (competitors.length !== 2) continue

      const teamA = normalizeTeam(competitors[0].team?.displayName)
      const teamB = normalizeTeam(competitors[1].team?.displayName)
      const winnerRaw = competitors.find(c => c.winner)
      const winner = normalizeTeam(winnerRaw?.team?.displayName)

      if (!winner) continue

      // Try to find our game ID
      let gameId = null

      // Check R1 matchups
      for (const [gid, teams] of Object.entries(BRACKET_MATCHUPS)) {
        if (
          (teams.includes(teamA) || teams.includes(teamB)) &&
          (teams.includes(teamA) || teams.includes(teamB))
        ) {
          if (teams.includes(teamA) && teams.includes(teamB)) {
            gameId = gid
            break
          }
        }
      }

      if (gameId && winner) {
        // Upsert into results table
        const { error } = await supabase
          .from('results')
          .upsert({ game_id: gameId, winner }, { onConflict: 'game_id' })

        if (!error) {
          updates.push({ gameId, winner, teamA, teamB })
        }
      }
    }

    return res.status(200).json({
      success: true,
      updated: updates.length,
      updates,
      skipped: skipped.length,
    })
  } catch (err) {
    console.error('Sync error:', err)
    return res.status(500).json({ error: err.message })
  }
}
