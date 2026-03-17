import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#fff'
      }}>
        <div style={{ color: '#FF6B35', fontFamily: 'sans-serif', fontSize: 13, letterSpacing: 2 }}>
          LOADING...
        </div>
      </div>
    )
  }

  return <Component {...pageProps} session={session} />
}
