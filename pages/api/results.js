// pages/api/results.js
// Fetches live NCAA tournament results from ESPN's public API
// and syncs them into our Supabase results table

export default async function handler(req, res) {
  try {
    // ESPN public API — no key required
    const url = 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=100'
    const response = await fetch(url)
    const data = await response.json()

    const results = {}

    if (data.events) {
      for (const event of data.events) {
        const status = event.status?.type?.name
        if (status !== 'STATUS_FINAL') continue

        const comp = event.competitions?.[0]
        if (!comp) continue

        const competitors = comp.competitors || []
        let winner = null
        competitors.forEach(c => {
          if (c.winner) winner = c.team?.shortDisplayName || c.team?.displayName
        })

        if (winner) {
          // Use ESPN event ID as key
          results[event.id] = winner
        }
      }
    }

    res.status(200).json({ results, count: Object.keys(results).length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
