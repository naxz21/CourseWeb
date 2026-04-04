'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RedeemCodeButton({ courseId }: { courseId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/access-codes/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, courseId }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Error al canjear código')
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      router.refresh()
    }, 1500)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          padding: '0.75rem 1.75rem',
          borderRadius: '999px',
          border: '1.5px solid rgba(74,124,63,0.4)',
          color: '#4A7C3F',
          background: 'transparent',
          fontSize: '0.9rem',
          fontFamily: 'Georgia, serif',
          cursor: 'pointer',
          letterSpacing: '0.02em',
        }}
      >
        Tengo un código de acceso
      </button>
    )
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.7)',
      border: '1px solid rgba(74,124,63,0.2)',
      borderRadius: '1rem',
      padding: '1.25rem',
      maxWidth: '360px',
    }}>
      <p style={{ fontSize: '0.85rem', color: '#4A7C3F', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
        Ingresá tu código de acceso
      </p>

      {success ? (
        <div style={{ background: 'rgba(74,124,63,0.1)', border: '1px solid rgba(74,124,63,0.3)', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#2D5A27' }}>
          ✓ ¡Código canjeado! Cargando el curso...
        </div>
      ) : (
        <form onSubmit={handleRedeem} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input
            type="text"
            placeholder="CODIGO-AQUI"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            style={{
              width: '100%',
              padding: '0.65rem 1rem',
              borderRadius: '0.75rem',
              border: '1.5px solid rgba(74,124,63,0.3)',
              background: 'rgba(255,255,255,0.8)',
              color: '#2C2C2C',
              fontSize: '0.95rem',
              fontFamily: 'Georgia, serif',
              outline: 'none',
              letterSpacing: '0.1em',
              boxSizing: 'border-box' as const,
            }}
            autoFocus
            required
          />

          {error && (
            <p style={{ fontSize: '0.8rem', color: '#8B2500', background: 'rgba(180,60,40,0.08)', border: '1px solid rgba(180,60,40,0.2)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', margin: 0 }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '0.6rem 1.5rem', borderRadius: '999px', background: '#4A7C3F', color: '#F5F2E8', fontSize: '0.875rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Canjeando...' : 'Canjear'}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setCode(''); setError('') }}
              style={{ padding: '0.6rem 1rem', borderRadius: '999px', border: '1.5px solid rgba(74,124,63,0.3)', color: '#5C5C4A', background: 'transparent', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Georgia, serif' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
