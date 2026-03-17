import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Home({ session }) {
  const router = useRouter()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) router.push('/bracket')
  }, [session])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'register') {
      if (!displayName.trim()) { setError('Display name is required'); setLoading(false); return }
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { display_name: displayName.trim() } },
      })
      if (error) { setError(error.message) }
      else {
       if (data.user) {
         const { error: profileError } = await supabase.from('profiles').insert({
         id: data.user.id,
         display_name: displayName.trim(),
         email
       })
       console.log('profile insert error:', profileError)
    }
    setSuccess('Account created! Signing you in...') 
        setSuccess('Account created! Signing you in...')
        setTimeout(() => router.push('/bracket'), 1000)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.brand}>
          <span style={s.brandBall}>🏀</span>
          <h1 style={s.brandTitle}>STRIZ<br/>BALL</h1>
          <p style={s.brandSub}>2026 NCAA Tournament<br/>Bracket Challenge</p>
          <div style={s.brandStats}>
            <div style={s.stat}>
              <div style={s.statNum}>64</div>
              <div style={s.statLabel}>Teams</div>
            </div>
            <div style={s.statDiv} />
            <div style={s.stat}>
              <div style={s.statNum}>6</div>
              <div style={s.statLabel}>Rounds</div>
            </div>
            <div style={s.statDiv} />
            <div style={s.stat}>
              <div style={s.statNum}>63</div>
              <div style={s.statLabel}>Games</div>
            </div>
          </div>
          <div style={s.lockBadge}>
            🔒 Picks lock Thursday morning before tip-off
          </div>
        </div>
      </div>

      <div style={s.right}>
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h2 style={s.cardTitle}>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </h2>
            <p style={s.cardSub}>
              {mode === 'login'
                ? "Don't have an account? "
                : "Already have an account? "}
              <button style={s.switchBtn} onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess('') }}>
                {mode === 'login' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </div>

          <form onSubmit={handleSubmit} style={s.form}>
            {mode === 'register' && (
              <div style={s.field}>
                <label style={s.label}>Display Name</label>
                <input style={s.input} type="text" placeholder="How you'll appear in the standings" value={displayName} onChange={e => setDisplayName(e.target.value)} required />
              </div>
            )}
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input style={s.input} type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input style={s.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>
            {error && <div style={s.error}>{error}</div>}
            {success && <div style={s.successMsg}>{success}</div>}
            <button style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    background: '#fff',
  },
  left: {
    flex: 1,
    background: '#FF6B35',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    minHeight: '100vh',
  },
  brand: {
    color: '#fff',
    maxWidth: 360,
  },
  brandBall: {
    fontSize: 64,
    display: 'block',
    marginBottom: 16,
  },
  brandTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 100,
    lineHeight: 0.85,
    letterSpacing: 6,
    color: '#fff',
    marginBottom: 20,
  },
  brandSub: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 1.6,
    marginBottom: 40,
  },
  brandStats: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    marginBottom: 32,
  },
  stat: { textAlign: 'center' },
  statNum: { fontSize: 32, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, textTransform: 'uppercase' },
  statDiv: { width: 1, height: 40, background: 'rgba(255,255,255,0.3)' },
  lockBadge: {
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: 8,
    padding: '10px 16px',
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    background: '#faf9f8',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: 40,
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    border: '1px solid #ede8e2',
  },
  cardHeader: { marginBottom: 28 },
  cardTitle: { fontSize: 24, fontWeight: 600, color: '#1a1208', marginBottom: 8 },
  cardSub: { fontSize: 13, color: '#a89880' },
  switchBtn: {
    background: 'none', border: 'none', color: '#FF6B35',
    fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: 0,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 500, color: '#6b5f52', letterSpacing: 0.3 },
  input: {
    background: '#faf9f8', border: '1.5px solid #e8e2dc', borderRadius: 8,
    padding: '11px 14px', color: '#1a1208', fontSize: 14, outline: 'none',
    transition: 'border-color 0.2s',
  },
  error: {
    background: '#fef2f2', border: '1px solid #fecaca',
    color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13,
  },
  successMsg: {
    background: '#f0fdf4', border: '1px solid #bbf7d0',
    color: '#16a34a', padding: '10px 14px', borderRadius: 8, fontSize: 13,
  },
  submitBtn: {
    background: '#FF6B35', color: '#fff', border: 'none', borderRadius: 8,
    padding: '13px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
    transition: 'background 0.2s', marginTop: 4,
  },
}
