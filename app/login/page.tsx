'use client'
import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginContent() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [year, setYear] = useState('')
  const [semester, setSemester] = useState('')
  const [isSignUp, setIsSignUp] = useState(searchParams.get('signup') === 'true')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, year, semester } }
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

  const inputStyle = {
    width: '100%',
    background: '#0d0d0d',
    border: '1px solid #2a2a2a',
    borderRadius: 10,
    padding: '11px 14px',
    color: '#e0e0e0',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  }

  const labelStyle = {
    fontSize: 11,
    color: '#666',
    fontWeight: 600,
    display: 'block',
    marginBottom: 6,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap'); * { box-sizing: border-box; } select option { background: #1a1a1a; color: #e0e0e0; }`}</style>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, background: '#c8f04e', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 12px' }}>☑</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#f0f0f0' }}>MedQCM</div>
          <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>Faculté de Médecine et de Pharmacie d'Oujda</div>
        </div>

        {/* Card */}
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 18, padding: '28px 24px' }}>

          {/* Toggle */}
          <div style={{ display: 'flex', background: '#0d0d0d', borderRadius: 10, padding: 4, marginBottom: 24, gap: 4 }}>
            {(['connexion', 'inscription'] as const).map((mode) => (
              <button key={mode} onClick={() => setIsSignUp(mode === 'inscription')}
                style={{ flex: 1, padding: '9px 4px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: (mode === 'inscription') === isSignUp ? '#c8f04e' : 'transparent', color: (mode === 'inscription') === isSignUp ? '#0a0a0a' : '#666', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                {mode === 'connexion' ? '🔑 Connexion' : '✨ Inscription'}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>

            {/* Signup-only fields */}
            {isSignUp && (
              <>
                <div>
                  <label style={labelStyle}>Nom complet</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom" style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Année</label>
                    <select value={year} onChange={e => setYear(e.target.value)}
                      style={{ ...inputStyle, color: year ? '#e0e0e0' : '#555', cursor: 'pointer' }}>
                      <option value="">Choisir</option>
                      <option value="1">1ère année</option>
                      <option value="2">2ème année</option>
                      <option value="3">3ème année</option>
                      <option value="4">4ème année</option>
                      <option value="5">5ème année</option>
                      <option value="6">6ème année</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Semestre</label>
                    <select value={semester} onChange={e => setSemester(e.target.value)}
                      style={{ ...inputStyle, color: semester ? '#e0e0e0' : '#555', cursor: 'pointer' }}>
                      <option value="">Choisir</option>
                      <option value="S1">Semestre 1</option>
                      <option value="S2">Semestre 2</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Common fields */}
            <div>
              <label style={labelStyle}>Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" type="email" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Mot de passe</label>
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type="password" style={inputStyle} />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#f04e4e11', border: '1px solid #f04e4e44', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#f04e4e', marginBottom: 16 }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading}
            style={{ width: '100%', background: '#c8f04e', color: '#0a0a0a', border: 'none', borderRadius: 10, padding: '13px', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}>
            {loading ? 'Chargement...' : isSignUp ? 'Créer mon compte' : 'Se connecter'}
          </button>

          {/* Switch */}
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#555' }}>
            {isSignUp ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
            <button onClick={() => setIsSignUp(!isSignUp)} style={{ background: 'none', border: 'none', color: '#c8f04e', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: 0, fontFamily: 'inherit' }}>
              {isSignUp ? 'Se connecter' : "S'inscrire"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#c8f04e', fontSize: 13, fontWeight: 600 }}>Chargement...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
