'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name } }
      })
      if (error) setError(error.message)
      else router.push('/')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400, background: '#111', border: '1px solid #1e1e1e', borderRadius: 16, padding: 32 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f0f0f0', marginBottom: 4 }}>
          {isSignUp ? 'Créer un compte' : 'Connexion'}
        </div>
        <div style={{ fontSize: 13, color: '#555', marginBottom: 24 }}>MonQCM · Médecine</div>
        {isSignUp && (
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="Nom complet" style={inputStyle} />
        )}
        <input value={email} onChange={e => setEmail(e.target.value)}
          placeholder="Email" type="email" style={inputStyle} />
        <input value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Mot de passe" type="password" style={inputStyle} />
        {error && <div style={{ color: '#f04e4e', fontSize: 12, marginBottom: 12 }}>{error}</div>}
        <button onClick={handleSubmit} disabled={loading}
          style={{ width: '100%', background: '#c8f04e', color: '#0a0a0a', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 16 }}>
          {loading ? '...' : isSignUp ? "S'inscrire" : 'Se connecter'}
        </button>
        <div style={{ textAlign: 'center', fontSize: 12, color: '#555' }}>
          {isSignUp ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
          <span onClick={() => setIsSignUp(!isSignUp)} style={{ color: '#c8f04e', cursor: 'pointer' }}>
            {isSignUp ? 'Se connecter' : "S'inscrire"}
          </span>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a',
  borderRadius: 10, padding: '11px 14px', color: '#e0e0e0', fontSize: 13,
  outline: 'none', marginBottom: 12, boxSizing: 'border-box', fontFamily: 'inherit'
}