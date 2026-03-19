// pages/api/sync-results.js
// Automatically fetches NCAA tournament results from ESPN
// and maps them to our bracket game IDs in Supabase.

import { createClient } from ‘@supabase/supabase-js’

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE_KEY
)

const TEAM_ALIASES = {
// East
‘Duke Blue Devils’: ‘Duke’, ‘Duke’: ‘Duke’,
‘Ohio State Buckeyes’: ‘Ohio State’, ‘Ohio State’: ‘Ohio State’,
‘TCU Horned Frogs’: ‘TCU’, ‘TCU’: ‘TCU’,
“St. John’s Red Storm”: “St. John’s”, “Saint John’s”: “St. John’s”,
‘Northern Iowa Panthers’: ‘Northern Iowa’, ‘Northern Iowa’: ‘Northern Iowa’,
‘Kansas Jayhawks’: ‘Kansas’, ‘Kansas’: ‘Kansas’,
‘California Baptist Lancers’: ‘Cal Baptist’, ‘California Baptist’: ‘Cal Baptist’, ‘Cal Baptist’: ‘Cal Baptist’,
‘Louisville Cardinals’: ‘Louisville’, ‘Louisville’: ‘Louisville’,
‘South Florida Bulls’: ‘South Florida’, ‘USF’: ‘South Florida’, ‘South Florida’: ‘South Florida’,
‘Michigan State Spartans’: ‘Michigan State’, ‘Michigan State’: ‘Michigan State’,
‘North Dakota State Bison’: ‘N. Dakota State’, ‘NDSU’: ‘N. Dakota State’, ‘North Dakota State’: ‘N. Dakota State’,
‘UCLA Bruins’: ‘UCLA’, ‘UCLA’: ‘UCLA’,
‘UCF Knights’: ‘UCF’, ‘UCF’: ‘UCF’, ‘Central Florida’: ‘UCF’,
‘Connecticut Huskies’: ‘UConn’, ‘UConn’: ‘UConn’, ‘Connecticut’: ‘UConn’,
‘Furman Paladins’: ‘Furman’, ‘Furman’: ‘Furman’,
‘Siena Saints’: ‘Siena’, ‘Siena’: ‘Siena’,

// West
‘Arizona Wildcats’: ‘Arizona’, ‘Arizona’: ‘Arizona’,
‘LIU Sharks’: ‘LIU’, ‘LIU’: ‘LIU’, ‘Long Island’: ‘LIU’,
‘Villanova Wildcats’: ‘Villanova’, ‘Villanova’: ‘Villanova’,
‘Utah State Aggies’: ‘Utah State’, ‘Utah State’: ‘Utah State’,
‘Wisconsin Badgers’: ‘Wisconsin’, ‘Wisconsin’: ‘Wisconsin’,
‘High Point Panthers’: ‘High Point’, ‘High Point’: ‘High Point’,
‘Arkansas Razorbacks’: ‘Arkansas’, ‘Arkansas’: ‘Arkansas’,
“Hawai’i Rainbow Warriors”: “Hawai’i”, “Hawaii”: “Hawai’i”, “Hawai’i”: “Hawai’i”,
‘BYU Cougars’: ‘BYU’, ‘BYU’: ‘BYU’, ‘Brigham Young’: ‘BYU’,
‘Texas Longhorns’: ‘Texas’, ‘Texas’: ‘Texas’,
‘Gonzaga Bulldogs’: ‘Gonzaga’, ‘Gonzaga’: ‘Gonzaga’,
‘Kennesaw State Owls’: ‘Kennesaw State’, ‘Kennesaw State’: ‘Kennesaw State’,
‘Miami Hurricanes’: ‘Miami FL’, ‘Miami (FL)’: ‘Miami FL’, ‘Miami FL’: ‘Miami FL’,
‘Missouri Tigers’: ‘Missouri’, ‘Missouri’: ‘Missouri’,
‘Purdue Boilermakers’: ‘Purdue’, ‘Purdue’: ‘Purdue’,
‘Queens Royals’: ‘Queens’, ‘Queens’: ‘Queens’,

// Midwest
‘Michigan Wolverines’: ‘Michigan’, ‘Michigan’: ‘Michigan’,
‘Howard Bison’: ‘Howard’, ‘Howard’: ‘Howard’,
‘Georgia Bulldogs’: ‘Georgia’, ‘Georgia’: ‘Georgia’,
‘Saint Louis Billikens’: ‘Saint Louis’, ‘Saint Louis’: ‘Saint Louis’,
‘Texas Tech Red Raiders’: ‘Texas Tech’, ‘Texas Tech’: ‘Texas Tech’,
‘Akron Zips’: ‘Akron’, ‘Akron’: ‘Akron’,
‘Alabama Crimson Tide’: ‘Alabama’, ‘Alabama’: ‘Alabama’,
‘Hofstra Pride’: ‘Hofstra’, ‘Hofstra’: ‘Hofstra’,
‘Tennessee Volunteers’: ‘Tennessee’, ‘Tennessee’: ‘Tennessee’,
‘SMU Mustangs’: ‘SMU/Miami (OH)’, ‘SMU’: ‘SMU/Miami (OH)’,
‘Miami (OH) RedHawks’: ‘SMU/Miami (OH)’, ‘Miami Ohio’: ‘SMU/Miami (OH)’, ‘Miami (OH)’: ‘SMU/Miami (OH)’,
‘Virginia Cavaliers’: ‘Virginia’, ‘Virginia’: ‘Virginia’,
‘Wright State Raiders’: ‘Wright State’, ‘Wright State’: ‘Wright State’,
‘Kentucky Wildcats’: ‘Kentucky’, ‘Kentucky’: ‘Kentucky’,
‘Santa Clara Broncos’: ‘Santa Clara’, ‘Santa Clara’: ‘Santa Clara’,
‘Iowa State Cyclones’: ‘Iowa State’, ‘Iowa State’: ‘Iowa State’,
‘Tennessee State Tigers’: ‘Tennessee State’, ‘Tennessee State’: ‘Tennessee State’,

// South
‘Florida Gators’: ‘Florida’, ‘Florida’: ‘Florida’,
‘Prairie View A&M Panthers’: ‘Prairie View/Lehigh’, ‘Prairie View’: ‘Prairie View/Lehigh’,
‘Lehigh Mountain Hawks’: ‘Prairie View/Lehigh’, ‘Lehigh’: ‘Prairie View/Lehigh’,
‘Clemson Tigers’: ‘Clemson’, ‘Clemson’: ‘Clemson’,
‘Iowa Hawkeyes’: ‘Iowa’, ‘Iowa’: ‘Iowa’,
‘Vanderbilt Commodores’: ‘Vanderbilt’, ‘Vanderbilt’: ‘Vanderbilt’,
‘McNeese Cowboys’: ‘McNeese State’, ‘McNeese State’: ‘McNeese State’, ‘McNeese’: ‘McNeese State’,
‘Nebraska Cornhuskers’: ‘Nebraska’, ‘Nebraska’: ‘Nebraska’,
‘Troy Trojans’: ‘Troy’, ‘Troy’: ‘Troy’,
‘North Carolina Tar Heels’: ‘North Carolina’, ‘North Carolina’: ‘North Carolina’,
‘VCU Rams’: ‘VCU’, ‘VCU’: ‘VCU’,
‘Illinois Fighting Illini’: ‘Illinois’, ‘Illinois’: ‘Illinois’,
‘Pennsylvania Quakers’: ‘Penn’, ‘Penn’: ‘Penn’,
“Saint Mary’s Gaels”: “St. Mary’s”, “St. Mary’s”: “St. Mary’s”,
‘Texas A&M Aggies’: ‘Texas A&M’, ‘Texas A&M’: ‘Texas A&M’,
‘Houston Cougars’: ‘Houston’, ‘Houston’: ‘Houston’,
‘Idaho Vandals’: ‘Idaho’, ‘Idaho’: ‘Idaho’,
}

function normalizeTeam(name) {
if (!name) return null
return TEAM_ALIASES[name] || TEAM_ALIASES[name.trim()] || name
}

const BRACKET_MATCHUPS = {
‘E_R1_1’: [‘Duke’, ‘Siena’],
‘E_R1_2’: [‘Ohio State’, ‘TCU’],
‘E_R1_3’: [“St. John’s”, ‘Northern Iowa’],
‘E_R1_4’: [‘Kansas’, ‘Cal Baptist’],
‘E_R1_5’: [‘Louisville’, ‘South Florida’],
‘E_R1_6’: [‘Michigan State’, ‘N. Dakota State’],
‘E_R1_7’: [‘UCLA’, ‘UCF’],
‘E_R1_8’: [‘UConn’, ‘Furman’],
‘W_R1_1’: [‘Arizona’, ‘LIU’],
‘W_R1_2’: [‘Villanova’, ‘Utah State’],
‘W_R1_3’: [‘Wisconsin’, ‘High Point’],
‘W_R1_4’: [‘Arkansas’, “Hawai’i”],
‘W_R1_5’: [‘BYU’, ‘Texas’],
‘W_R1_6’: [‘Gonzaga’, ‘Kennesaw State’],
‘W_R1_7’: [‘Miami FL’, ‘Missouri’],
‘W_R1_8’: [‘Purdue’, ‘Queens’],
‘M_R1_1’: [‘Michigan’, ‘Howard’],
‘M_R1_2’: [‘Georgia’, ‘Saint Louis’],
‘M_R1_3’: [‘Texas Tech’, ‘Akron’],
‘M_R1_4’: [‘Alabama’, ‘Hofstra’],
‘M_R1_5’: [‘Tennessee’, ‘SMU/Miami (OH)’],
‘M_R1_6’: [‘Virginia’, ‘Wright State’],
‘M_R1_7’: [‘Kentucky’, ‘Santa Clara’],
‘M_R1_8’: [‘Iowa State’, ‘Tennessee State’],
‘S_R1_1’: [‘Florida’, ‘Prairie View/Lehigh’],
‘S_R1_2’: [‘Clemson’, ‘Iowa’],
‘S_R1_3’: [‘Vanderbilt’, ‘McNeese State’],
‘S_R1_4’: [‘Nebraska’, ‘Troy’],
‘S_R1_5’: [‘North Carolina’, ‘VCU’],
‘S_R1_6’: [‘Illinois’, ‘Penn’],
‘S_R1_7’: [“St. Mary’s”, ‘Texas A&M’],
‘S_R1_8’: [‘Houston’, ‘Idaho’],
}

export default async function handler(req, res) {
try {
const url = ‘https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=100’
const response = await fetch(url)
const data = await response.json()
const updates = []

```
if (!data.events || data.events.length === 0) {
  return res.status(200).json({ message: 'No games found', updates: [] })
}

for (const event of data.events) {
  const statusName = event.status?.type?.name
  if (statusName !== 'STATUS_FINAL') continue

  const comp = event.competitions?.[0]
  if (!comp) continue

  const competitors = comp.competitors || []
  if (competitors.length !== 2) continue

  const teamA = normalizeTeam(competitors[0].team?.displayName)
  const teamB = normalizeTeam(competitors[1].team?.displayName)
  const winnerComp = competitors.find(c => c.winner)
  const winner = normalizeTeam(winnerComp?.team?.displayName)

  if (!winner) continue

  let gameId = null
  for (const [gid, teams] of Object.entries(BRACKET_MATCHUPS)) {
    if (teams.includes(teamA) && teams.includes(teamB)) {
      gameId = gid
      break
    }
  }

  if (gameId && winner) {
    const { error } = await supabase
      .from('results')
      .upsert({ game_id: gameId, winner }, { onConflict: 'game_id' })
    if (!error) updates.push({ gameId, winner })
  }
}

return res.status(200).json({ success: true, updated: updates.length, updates })
```

} catch (err) {
console.error(‘Sync error:’, err)
return res.status(500).json({ error: err.message })
}
}
