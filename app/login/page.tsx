'use client'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 360, background: '#111', border: '1px solid #1e1e1e', borderRadius: 16, padding: 32 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#f0f0f0', marginBottom: 24 }}>Connexion</div>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email"
          style={{ width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 10, padding: '11px 14px', color: '#e0e0e0', fontSize: 13, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }} />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" type="password"
          style={{ width: '100%', background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 10, padding: '11px 14px', color: '#e0e0e0', fontSize: 13, outline: 'none', marginBottom: 16, boxSizing: 'border-box' }} />
        <button style={{ width: '100%', background: '#c8f04e', color: '#0a0a0a', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          Se connecter
        </button>
      </div>
    </div>
  )
}