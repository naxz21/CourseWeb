'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        // Supabase maneja la persistencia via cookies — este flag le indica
        // al cliente si debe mantener la sesión en localStorage también
      },
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    // Si NO quiere recordar, borramos la sesión de localStorage al cerrar el tab
    if (!remember) {
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Sin persistencia adicional — solo sesión de navegador
        }
      })
    }

    await fetch('/api/profile/ensure', { method: 'POST' })
    router.push('/dashboard')
    router.refresh()
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    border: '1.5px solid rgba(74,124,63,0.3)',
    background: 'rgba(255,255,255,0.7)',
    color: '#2C2C2C',
    fontSize: '0.95rem',
    fontFamily: 'Georgia, serif',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    fontSize: '0.8rem',
    color: '#4A7C3F',
    letterSpacing: '0.05em',
    display: 'block' as const,
    marginBottom: '0.4rem',
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #F5F2E8 0%, #EDE8D5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        fontFamily: 'Georgia, serif',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(74,124,63,0.2)',
            borderRadius: '1.5rem',
            padding: '2.5rem 2rem',
            boxShadow: '0 8px 40px rgba(74,124,63,0.08)',
          }}
        >
          <h1 style={{ fontSize: '1.75rem', fontWeight: '400', color: '#2D5A27', marginBottom: '0.5rem', textAlign: 'center' }}>
            Bienvenido de vuelta
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#5C5C4A', textAlign: 'center', marginBottom: '2rem' }}>
            Ingresá tu cuenta para continuar
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Correo electrónico</label>
              <input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Contraseña</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
            </div>

            {/* Recordar sesión */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', userSelect: 'none' }}>
              <div
                onClick={() => setRemember(!remember)}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  border: `2px solid ${remember ? '#4A7C3F' : 'rgba(74,124,63,0.4)'}`,
                  background: remember ? '#4A7C3F' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                }}
              >
                {remember && <span style={{ color: '#F5F2E8', fontSize: '11px', lineHeight: 1 }}>✓</span>}
              </div>
              <span style={{ fontSize: '0.85rem', color: '#5C5C4A' }}>Recordar mi sesión</span>
            </label>

            {message && (
              <div style={{ background: 'rgba(180,60,40,0.08)', border: '1px solid rgba(180,60,40,0.2)', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#8B2500' }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ marginTop: '0.5rem', padding: '0.875rem', borderRadius: '999px', background: loading ? '#7aaa6f' : '#4A7C3F', color: '#F5F2E8', fontSize: '1rem', fontFamily: 'Georgia, serif', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.03em', boxShadow: '0 4px 16px rgba(74,124,63,0.2)' }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#5C5C4A' }}>
            ¿No tenés cuenta?{' '}
            <a href="/register" style={{ color: '#4A7C3F', textDecoration: 'none', fontWeight: 'bold' }}>Registrarse</a>
          </p>
        </div>
      </div>
    </main>
  )
}
