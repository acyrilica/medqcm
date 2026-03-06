'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import LandingPage from '@/components/LandingPage'
import Platform from '@/components/Platform'

export default function Home() {
  const [user, setUser] = useState<null | object>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#c8f04e', fontSize: 13, fontWeight: 600 }}>Chargement...</div>
    </div>
  )

  return user ? <Platform /> : <LandingPage />
}