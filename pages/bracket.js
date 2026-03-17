import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import {
  REGIONS, REGION_COLORS, BRACKET_DATA, ROUND_NAMES, ROUND_POINTS,
  buildEmptyPicks, getRegionRounds, isBracketLocked, calculateScores,
  getEliminatedTeams, buildRoundMap, LOCK_TIME
} from '../lib/bracketData'

export default function BracketPage({ session }) {
  const router = useRouter()
  const [view, setView] = useState('bracket') // bracket | leaderboard | view-user
  const [picks, setPicks] = useState(buildEmptyPicks())
  const [savedPicks, setSavedPicks] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)
  const [profile, setProfile] = useState(null)
  const [allBrackets, setAllBrackets] = useState([])
  const [results, setResults] = useState({})
  const [viewingUser, setViewingUser] = useState(null)
  const [timeLeft, setTimeLeft] = useState('')
  const locked = isBracketLocked()

  useEffect(() => { if (!session) router.push('/') }, [session])

  useEffect(() => {
    if (!session) return
    loadProfile()
    loadMyPicks()
    loadAllBrackets()
    loadResults()
  }, [session])

  // Countdown timer
  useEffect(() => {
    if (locked) return
    const tick = () => {
      const now = new Date()
      const diff = LOCK_TIME - now
      if (diff <= 0) { setTimeLeft('LOCKED'); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`)
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [locked])

  const loadProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
    setProfile(data)
  }

  const loadMyPicks = async () => {
    const { data, error } = await supabase.from('brackets').select('picks, updated_at').eq('user_id', session.user.id).single()
    console.log('loadMyPicks data:', data)
    console.log('loadMyPicks error:', error) 
    if (data) { setPicks(data.picks); setSavedPicks(data.picks); setSavedAt(data.updated_at) }
  }


  const loadAllBrackets = async () => {
    const { data: brackets, error } = await supabase
      .from('brackets')
      .select('user_id, picks, updated_at')
      .order('updated_at', { ascending: false })

    if (error) { console.log('brackets error:', error); return }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name')

    const merged = (brackets || []).map(b => ({
      ...b,
      profiles: profiles?.find(p => p.id === b.user_id) || null
    }))

    console.log('merged:', merged)
    setAllBrackets(merged)
  }


  const loadResults = async () => {
    const { data } = await supabase.from('results').select('game_id, winner')
    if (data) {
      const r = {}
      data.forEach(row => { r[row.game_id] = row.winner })
      setResults(r)
    }
  } 


  // Sync ESPN results then reload from Supabase
  const syncAndLoadResults = async () => {
    try { await fetch('/api/sync-results') } catch {}
    await loadResults()
    await loadAllBrackets()
  }

  // Browser-based polling every 5 minutes — no Vercel cron needed
  useEffect(() => {
    if (!locked) return
    syncAndLoadResults() // sync immediately on page load
    const interval = setInterval(syncAndLoadResults, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [locked])

  const handlePick = useCallback((gameId, team) => {
    if (locked) return
    setPicks(prev => ({ ...prev, [gameId]: team }))
    setDirty(true)
  }, [locked])


  const handleSave = async () => {
    if (locked) return
    setSaving(true)
    const { error } = await supabase.from('brackets').upsert(
      { user_id: session.user.id, picks, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    if (!error) {
      setSavedPicks(picks)
      setSavedAt(new Date().toISOString())
      setDirty(false)
      loadAllBrackets()
    }
    setSaving(false)
  }

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push('/') }

  const displayName = profile?.display_name || session?.user?.email?.split('@')[0] || 'Me'

  // Sort leaderboard
  const rankedBrackets = [...allBrackets].map(b => {
    const scores = calculateScores(b.picks, results)
    return { ...b, scores }
  }).sort((a, b) => {
    if (b.scores.total !== a.scores.total) return b.scores.total - a.scores.total
    return (b.profiles?.display_name || '').localeCompare(a.profiles?.display_name || '')
  })

  const myScores = calculateScores(picks, results)
  const eliminated = getEliminatedTeams(results, picks)

  if (!session) return null

  return (
    <div style={s.page}>
      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <span style={s.navBall}>🏀</span>
          <span style={s.navTitle}>STRIZBALL</span>
          <span style={s.navYear}>2026</span>
        </div>
        <div style={s.navCenter}>
          <button style={{ ...s.navBtn, ...(view === 'bracket' ? s.navBtnActive : {}) }} onClick={() => setView('bracket')}>
            My Bracket
          </button>
          <button style={{ ...s.navBtn, ...(view === 'leaderboard' || view === 'view-user' ? s.navBtnActive : {}) }} onClick={() => { setView('leaderboard'); loadAllBrackets() }}>
            Leaderboard {allBrackets.length > 0 && <span style={s.navPill}>{allBrackets.length}</span>}
          </button>
        </div>
        <div style={s.navRight}>
          {!locked && timeLeft && (
            <div style={s.countdown}>
              <span style={s.countdownLabel}>Locks in</span>
              <span style={s.countdownTime}>{timeLeft}</span>
            </div>
          )}
          {locked && <div style={s.lockedBadge}>🔒 Locked</div>}
          <span style={s.navUser}>{displayName}</span>
          <button style={s.signOutBtn} onClick={handleSignOut}>Sign Out</button>
        </div>
      </nav>

      {/* MY BRACKET */}
      {view === 'bracket' && (
        <div style={s.content}>
          {/* Score bar */}
          {locked && (
            <div style={s.scoreBar}>
              <div style={s.scoreBarInner}>
                <div style={s.scoreItem}>
                  <div style={s.scoreNum}>{myScores.total}</div>
                  <div style={s.scoreLabel}>Points</div>
                </div>
                <div style={s.scoreDivider} />
                <div style={s.scoreItem}>
                  <div style={{ ...s.scoreNum, color: '#d97706' }}>{myScores.maxPossible}</div>
                  <div style={s.scoreLabel}>Max Possible</div>
                </div>
                {Object.entries(ROUND_NAMES).map(([k, name]) => (
                  <div key={k} style={s.scoreRound}>
                    <div style={s.scoreRoundNum}>{myScores.byRound[k] || 0}</div>
                    <div style={s.scoreRoundLabel}>{name.replace('Round of ', 'R')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save bar */}
          {!locked && (
            <div style={s.saveBar}>
              <div style={s.saveBarLeft}>
                {dirty && <span style={s.unsaved}>● Unsaved changes</span>}
                {!dirty && savedAt && <span style={s.saved}>✓ Saved {new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
              </div>
              <button style={{ ...s.saveBtn, ...(dirty ? s.saveBtnActive : {}) }} onClick={handleSave} disabled={saving || !dirty}>
                {saving ? 'Saving...' : 'Save Bracket'}
              </button>
            </div>
          )}

          {/* Full bracket */}
          <FullBracket picks={picks} onPick={handlePick} results={results} eliminated={eliminated} locked={locked} />
        </div>
      )}

      {/* LEADERBOARD */}
      {view === 'leaderboard' && (
        <div style={s.content}>
          <div style={s.lbPage}>
            <div style={s.lbHeader}>
              <h2 style={s.lbTitle}>Leaderboard</h2>
              {!locked && <p style={s.lbSub}>Picks are hidden until tip-off Thursday morning</p>}
              {locked && <p style={s.lbSub}>Click any player to view their bracket</p>}
            </div>
            <div style={s.lbList}>
              {rankedBrackets.length === 0 && (
                <div style={s.emptyState}>No brackets submitted yet.</div>
              )}
              {rankedBrackets.map((b, i) => {
                const name = b.profiles?.display_name || 'Anonymous'
                const isMe = b.user_id === session.user.id
                return (
                  <div
                    key={b.user_id}
                    style={{ ...s.lbRow, ...(isMe ? s.lbRowMe : {}), ...(locked ? s.lbRowClickable : {}) }}
                    onClick={() => {
                      if (!locked) return
                      setViewingUser(b)
                      setView('view-user')
                    }}
                  >
                    <div style={s.lbRank}>{i + 1}</div>
                    <div style={s.lbName}>
                      {name}
                      {isMe && <span style={s.meTag}>YOU</span>}
                    </div>
                    <div style={s.lbScores}>
                      {locked ? (
                        <>
                          <span style={s.lbPts}>{b.scores.total} pts</span>
                          <span style={s.lbMax}>/ {b.scores.maxPossible} possible</span>
                        </>
                      ) : (
                        <span style={s.lbHidden}>Picks hidden until tip-off</span>
                      )}
                    </div>
                    {locked && <span style={s.lbArrow}>→</span>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW USER BRACKET */}
      {view === 'view-user' && viewingUser && (
        <div style={s.content}>
          <div style={s.viewHeader}>
            <button style={s.backBtn} onClick={() => setView('leaderboard')}>← Back to Leaderboard</button>
            <div style={s.viewHeaderRight}>
              <h2 style={s.viewTitle}>{viewingUser.profiles?.display_name}'s Bracket</h2>
              {locked && (
                <div style={s.viewScores}>
                  <span style={s.viewPts}>{calculateScores(viewingUser.picks, results).total} pts</span>
                  <span style={s.viewMax}>/ {calculateScores(viewingUser.picks, results).maxPossible} possible</span>
                </div>
              )}
            </div>
          </div>
          <FullBracket
            picks={viewingUser.picks}
            results={results}
            eliminated={getEliminatedTeams(results, viewingUser.picks)}
            locked={true}
            readOnly={true}
          />
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// FULL BRACKET — all 4 regions on one scrollable page
// ═══════════════════════════════════════════════════════
function FullBracket({ picks, onPick, results, eliminated, locked, readOnly }) {
  return (
    <div style={s.bracketPage}>
      {/* 4 Regions */}
      <div style={s.regionsGrid}>
        {REGIONS.map(region => (
          <RegionBracket
            key={region}
            region={region}
            picks={picks}
            onPick={onPick}
            results={results}
            eliminated={eliminated}
            locked={locked}
            readOnly={readOnly}
          />
        ))}
      </div>

      {/* Final Four */}
      <FinalFour picks={picks} onPick={onPick} results={results} eliminated={eliminated} locked={locked} readOnly={readOnly} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// REGION BRACKET
// ═══════════════════════════════════════════════════════
function RegionBracket({ region, picks, onPick, results, eliminated, locked, readOnly }) {
  const { r1, r2, r3, r4, winner } = getRegionRounds(region, picks)
  const color = REGION_COLORS[region]

  return (
    <div style={s.regionWrap}>
      <div style={{ ...s.regionHeader, borderLeftColor: color }}>
        <span style={{ ...s.regionName, color }}>{region} Region</span>
        {winner && <span style={s.regionWinner}>→ {winner}</span>}
      </div>
      <div style={s.regionScroll}>
        <div style={s.regionGrid}>
          {/* Round headers */}
          <div style={s.colHeaders}>
            {['R64', 'R32', 'S16', 'E8'].map(l => (
              <div key={l} style={s.colHeader}>{l}</div>
            ))}
          </div>
          <div style={s.cols}>
            <div style={s.col}>
              {r1.map(game => (
                <Matchup key={game.id} gameId={game.id} teams={game.teams.map(t => t.name)} seeds={game.teams.map(t => t.seed)} picks={picks} onPick={onPick} results={results} eliminated={eliminated} locked={locked} readOnly={readOnly} color={color} />
              ))}
            </div>
            <div style={s.col}>
              {r2.map(game => (
                <Matchup key={game.id} gameId={game.id} teams={game.teams} picks={picks} onPick={onPick} results={results} eliminated={eliminated} locked={locked} readOnly={readOnly} color={color} later />
              ))}
            </div>
            <div style={s.col}>
              {r3.map(game => (
                <Matchup key={game.id} gameId={game.id} teams={game.teams} picks={picks} onPick={onPick} results={results} eliminated={eliminated} locked={locked} readOnly={readOnly} color={color} later />
              ))}
            </div>
            <div style={s.col}>
              <Matchup gameId={r4.id} teams={r4.teams} picks={picks} onPick={onPick} results={results} eliminated={eliminated} locked={locked} readOnly={readOnly} color={color} later />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// FINAL FOUR
// ═══════════════════════════════════════════════════════
function FinalFour({ picks, onPick, results, eliminated, locked, readOnly }) {
  const regionWinners = { East: picks['E_R4'], West: picks['W_R4'], Midwest: picks['M_R4'], South: picks['S_R4'] }
  const ff1 = [regionWinners.East, regionWinners.South]
  const ff2 = [regionWinners.West, regionWinners.Midwest]
  const champ = [picks['FF_1'], picks['FF_2']]

  return (
    <div style={s.ffWrap}>
      <h3 style={s.ffTitle}>🏆 Final Four · April 4 &amp; Championship · April 6 — Indianapolis</h3>
      <div style={s.ffGrid}>
        <div style={s.ffPanel}>
          <div style={s.ffLabel}>East vs South</div>
          <Matchup gameId="FF_1" teams={ff1} picks={picks} onPick={onPick} results={results} eliminated={eliminated} locked={locked} readOnly={readOnly} color="#FF6B35" later wide />
        </div>
        <div style={s.ffChampPanel}>
          <div style={s.ffLabel}>🏆 Championship</div>
          <Matchup gameId="CHAMP" teams={champ} picks={picks} onPick={onPick} results={results} eliminated={eliminated} locked={locked} readOnly={readOnly} color="#d97706" later wide />
          {picks['CHAMP'] && (
            <div style={s.champBox}>
              <div style={s.champTrophy}>🏆</div>
              <div style={s.champName}>{picks['CHAMP']}</div>
              <div style={s.champSub}>Your Champion</div>
            </div>
          )}
        </div>
        <div style={s.ffPanel}>
          <div style={s.ffLabel}>West vs Midwest</div>
          <Matchup gameId="FF_2" teams={ff2} picks={picks} onPick={onPick} results={results} eliminated={eliminated} locked={locked} readOnly={readOnly} color="#FF6B35" later wide />
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// MATCHUP COMPONENT
// ═══════════════════════════════════════════════════════
function Matchup({ gameId, teams, seeds, picks, onPick, results, eliminated, locked, readOnly, color, later, wide }) {
  const [t1, t2] = teams || [null, null]
  const selected = picks?.[gameId]
  const actualWinner = results?.[gameId]
  const isDisabled = later && (!t1 || !t2)

  const getTeamStyle = (team) => {
    if (!team) return {}
    const isSelected = selected === team
    const isActualWinner = actualWinner === team
    const isActualLoser = actualWinner && actualWinner !== team
    const isEliminated = eliminated?.has(team)

    // ✅ Correct pick — green
    if (isActualWinner && isSelected) return {
      bg: '#f0fdf4', border: '#16a34a', color: '#15803d', fontWeight: 700,
      textDecoration: 'none', shadow: '0 0 0 2px #bbf7d0',
    }
    // ❌ Wrong pick in THIS game — obnoxious red
    if (isActualLoser && isSelected) return {
      bg: '#ff0000', border: '#cc0000', color: '#fff', fontWeight: 700,
      textDecoration: 'line-through', shadow: '0 0 0 2px #ff0000',
    }
    // ❌ Picked a team that already lost in a PREVIOUS round — still obnoxious red
    if (isEliminated && isSelected) return {
      bg: '#ff0000', border: '#cc0000', color: '#fff', fontWeight: 700,
      textDecoration: 'line-through', shadow: '0 0 0 2px #ff0000',
    }
    // Selected but game not played yet
    if (isSelected) return { bg: color + '15', border: color, color: '#1a1208', fontWeight: 600 }
    // Not selected, eliminated team (greyed out)
    if (isEliminated) return { bg: '#fafafa', border: '#e5e7eb', color: '#bbb', textDecoration: 'line-through' }
    return { bg: '#fff', border: '#e8e2dc', color: '#1a1208' }
  }

  const TeamBtn = ({ team, seed }) => {
    if (!team) return (
      <div style={s.teamEmpty}>
        <span style={{ color: '#c4b8ac' }}>TBD</span>
      </div>
    )
    const ts = getTeamStyle(team)
    const isSelected = selected === team
    const actualWin = results?.[gameId] === team
    const actualLoss = (results?.[gameId] && results[gameId] !== team && isSelected) || (eliminated?.has(team) && isSelected)

    return (
      <button
        style={{
          ...s.teamBtn,
          background: ts.bg,
          borderColor: ts.border,
          color: ts.color,
          textDecoration: ts.textDecoration,
          fontWeight: ts.fontWeight,
          boxShadow: ts.shadow || 'none',
          cursor: (readOnly || locked || isDisabled) ? 'default' : 'pointer',
          width: wide ? 200 : 160,
        }}
        onClick={() => !readOnly && !locked && !isDisabled && onPick && onPick(gameId, team)}
        disabled={readOnly || locked || isDisabled}
      >
        {seed !== undefined && (
          <span style={{
            ...s.seed,
            background: actualLoss ? 'rgba(0,0,0,0.2)' : '#f0ece8',
            color: actualLoss ? '#fff' : '#6b5f52',
          }}>{seed}</span>
        )}
        <span style={s.teamName}>{team}</span>
        {actualWin && isSelected && <span style={{ fontSize: 13 }}>✅</span>}
        {actualLoss && <span style={{ fontSize: 13 }}>💀</span>}
        {isSelected && !results?.[gameId] && !eliminated?.has(team) && <span style={{ color, fontSize: 11 }}>●</span>}
      </button>
    )
  }

  return (
    <div style={{ ...s.matchup, opacity: isDisabled ? 0.4 : 1 }}>
      <TeamBtn team={t1} seed={seeds?.[0]} />
      <div style={s.vsLine} />
      <TeamBtn team={t2} seed={seeds?.[1]} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════
const s = {
  page: { minHeight: '100vh', background: '#faf9f8', display: 'flex', flexDirection: 'column' },

  // Nav
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 20px', height: 56, background: '#fff',
    borderBottom: '1px solid #e8e2dc', position: 'sticky', top: 0, zIndex: 100,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  navBall: { fontSize: 20 },
  navTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3, color: '#1a1208' },
  navYear: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: '#FF6B35', letterSpacing: 2 },
  navCenter: { display: 'flex', gap: 4 },
  navBtn: {
    background: 'transparent', border: 'none', padding: '6px 14px',
    borderRadius: 8, color: '#a89880', fontSize: 13, fontWeight: 500,
    display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
  },
  navBtnActive: { background: '#fff1eb', color: '#FF6B35' },
  navPill: { background: '#FF6B35', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10 },
  navRight: { display: 'flex', alignItems: 'center', gap: 12 },
  navUser: { fontSize: 13, color: '#6b5f52', fontWeight: 500 },
  countdown: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  countdownLabel: { fontSize: 9, color: '#a89880', letterSpacing: 1, textTransform: 'uppercase' },
  countdownTime: { fontSize: 13, fontWeight: 600, color: '#FF6B35' },
  lockedBadge: { background: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 },
  signOutBtn: {
    background: 'transparent', border: '1px solid #e8e2dc', color: '#a89880',
    padding: '5px 12px', borderRadius: 6, fontSize: 12, transition: 'all 0.15s',
  },

  content: { flex: 1, display: 'flex', flexDirection: 'column' },

  // Score bar
  scoreBar: { background: '#fff', borderBottom: '1px solid #e8e2dc', padding: '10px 20px' },
  scoreBarInner: { display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' },
  scoreItem: { textAlign: 'center' },
  scoreNum: { fontSize: 24, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1, color: '#FF6B35' },
  scoreLabel: { fontSize: 10, color: '#a89880', letterSpacing: 1, textTransform: 'uppercase' },
  scoreDivider: { width: 1, height: 36, background: '#e8e2dc' },
  scoreRound: { textAlign: 'center', padding: '0 8px' },
  scoreRoundNum: { fontSize: 16, fontWeight: 600, color: '#1a1208' },
  scoreRoundLabel: { fontSize: 9, color: '#a89880', letterSpacing: 0.5 },

  // Save bar
  saveBar: {
    background: '#fff', borderBottom: '1px solid #e8e2dc',
    padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  saveBarLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  unsaved: { color: '#d97706', fontSize: 12, fontWeight: 500 },
  saved: { color: '#16a34a', fontSize: 12 },
  saveBtn: {
    background: '#e8e2dc', color: '#a89880', border: 'none', borderRadius: 8,
    padding: '7px 18px', fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
  },
  saveBtnActive: { background: '#FF6B35', color: '#fff', cursor: 'pointer' },

  // Bracket page
  bracketPage: { padding: 20, overflowX: 'auto' },
  regionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24, minWidth: 900 },

  // Region
  regionWrap: { background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e8e2dc' },
  regionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingLeft: 10, borderLeft: '3px solid' },
  regionName: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 2 },
  regionWinner: { fontSize: 12, color: '#6b5f52', fontWeight: 500 },
  regionScroll: { overflowX: 'auto' },
  regionGrid: { minWidth: 680 },
  colHeaders: { display: 'flex', gap: 4, marginBottom: 4, paddingLeft: 2 },
  colHeader: { width: 164, fontSize: 9, color: '#a89880', letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center' },
  cols: { display: 'flex', gap: 4, alignItems: 'stretch' },
  col: { display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: 4, flex: '0 0 164px' },

  // Matchup
  matchup: { display: 'flex', flexDirection: 'column', gap: 1, padding: '3px 0' },
  vsLine: { height: 1, background: '#f0ece8', margin: '0 8px' },
  teamBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    border: '1.5px solid', borderRadius: 6, padding: '6px 8px',
    fontSize: 11, textAlign: 'left', transition: 'all 0.12s',
    background: '#fff', fontFamily: "'DM Sans', sans-serif",
  },
  teamEmpty: {
    display: 'flex', alignItems: 'center',
    border: '1.5px solid #f0ece8', borderRadius: 6, padding: '6px 8px',
    fontSize: 11, background: '#faf9f8', height: 32, color: '#c4b8ac', width: 160,
  },
  seed: {
    background: '#f0ece8', borderRadius: 3, padding: '1px 5px',
    fontSize: 9, fontWeight: 600, flexShrink: 0, minWidth: 18, textAlign: 'center', color: '#6b5f52',
  },
  teamName: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },

  // Final Four
  ffWrap: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e8e2dc', minWidth: 900 },
  ffTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2, color: '#1a1208', marginBottom: 20 },
  ffGrid: { display: 'flex', gap: 24, alignItems: 'flex-start' },
  ffPanel: { flex: 1 },
  ffChampPanel: { flex: 1, background: '#fffbf0', borderRadius: 10, padding: 16, border: '1px solid #fde68a' },
  ffLabel: { fontSize: 11, color: '#a89880', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  champBox: { marginTop: 16, textAlign: 'center', padding: 16, background: '#fff', borderRadius: 10, border: '2px solid #d97706' },
  champTrophy: { fontSize: 36, marginBottom: 8 },
  champName: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 3, color: '#d97706' },
  champSub: { color: '#a89880', fontSize: 11, letterSpacing: 1, marginTop: 2 },

  // Leaderboard
  lbPage: { maxWidth: 700, margin: '0 auto', padding: 28, width: '100%' },
  lbHeader: { marginBottom: 24 },
  lbTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 3, color: '#1a1208' },
  lbSub: { color: '#a89880', fontSize: 13, marginTop: 4 },
  lbList: { display: 'flex', flexDirection: 'column', gap: 8 },
  lbRow: {
    display: 'flex', alignItems: 'center', gap: 14,
    background: '#fff', border: '1px solid #e8e2dc', borderRadius: 10,
    padding: '14px 18px', transition: 'all 0.15s',
  },
  lbRowMe: { border: '2px solid #FF6B35', background: '#fff8f5' },
  lbRowClickable: { cursor: 'pointer' },
  lbRank: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: '#a89880', width: 28, flexShrink: 0 },
  lbName: { flex: 1, fontSize: 16, fontWeight: 500, color: '#1a1208', display: 'flex', alignItems: 'center', gap: 8 },
  meTag: { background: '#FF6B35', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, letterSpacing: 1 },
  lbScores: { display: 'flex', alignItems: 'baseline', gap: 6 },
  lbPts: { fontSize: 18, fontWeight: 700, color: '#FF6B35' },
  lbMax: { fontSize: 12, color: '#a89880' },
  lbHidden: { fontSize: 12, color: '#c4b8ac', fontStyle: 'italic' },
  lbArrow: { color: '#c4b8ac', fontSize: 18 },
  emptyState: { textAlign: 'center', color: '#a89880', padding: '60px 20px', fontSize: 14 },

  // View user
  viewHeader: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '12px 20px', background: '#fff', borderBottom: '1px solid #e8e2dc',
  },
  backBtn: { background: 'transparent', border: 'none', color: '#a89880', fontSize: 13, cursor: 'pointer' },
  viewHeaderRight: { display: 'flex', alignItems: 'center', gap: 16 },
  viewTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, color: '#1a1208' },
  viewScores: { display: 'flex', alignItems: 'baseline', gap: 6 },
  viewPts: { fontSize: 18, fontWeight: 700, color: '#FF6B35' },
  viewMax: { fontSize: 12, color: '#a89880' },
}
