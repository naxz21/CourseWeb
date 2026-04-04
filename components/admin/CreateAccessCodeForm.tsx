'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Course = { id: string; title: string }

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return {}
  return { Authorization: `Bearer ${session.access_token}` }
}

export default function CreateAccessCodeForm({ courses }: { courses: Course[] }) {
  const router = useRouter()
  const [courseId, setCourseId] = useState(courses[0]?.id || '')
  const [code, setCode] = useState('')
  const [maxUses, setMaxUses] = useState('1')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let result = ''
    for (let i = 0; i < 12; i++) {
      if (i === 4 || i === 8) result += '-'
      result += chars[Math.floor(Math.random() * chars.length)]
    }
    setCode(result)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) { setError('Ingresá un código'); return }
    setLoading(true)
    setError('')
    setSuccess(false)

    const authHeaders = await getAuthHeaders()
    const res = await fetch('/api/admin/access-codes/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ courseId, code: code.trim().toUpperCase(), maxUses: Number(maxUses) }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Error al crear código'); setLoading(false); return }

    setCode('')
    setMaxUses('1')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
    router.refresh()
    setLoading(false)
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    border: '1.5px solid rgba(74,124,63,0.3)',
    background: 'rgba(255,255,255,0.8)',
    color: '#2C2C2C',
    fontSize: '0.9rem',
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={labelStyle}>Curso</label>
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)} style={inputStyle} required>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Código</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="AAAA-BBBB-CCCC"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            style={{ ...inputStyle, letterSpacing: '0.1em', flex: 1 }}
            required
          />
          <button
            type="button"
            onClick={generateCode}
            style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1.5px solid rgba(74,124,63,0.3)', color: '#4A7C3F', background: 'transparent', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Georgia, serif' }}
          >
            Generar
          </button>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Límite de usos <span style={{ color: '#8B6914' }}>(0 = ilimitado)</span></label>
        <input type="number" min="0" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} style={inputStyle} />
      </div>

      {error && <p style={{ fontSize: '0.875rem', color: '#8B2500', background: 'rgba(180,60,40,0.08)', border: '1px solid rgba(180,60,40,0.2)', borderRadius: '0.75rem', padding: '0.75rem 1rem', margin: 0 }}>{error}</p>}
      {success && <p style={{ fontSize: '0.875rem', color: '#2D5A27', background: 'rgba(74,124,63,0.1)', border: '1px solid rgba(74,124,63,0.3)', borderRadius: '0.75rem', padding: '0.75rem 1rem', margin: 0 }}>✓ Código creado correctamente</p>}

      <button
        type="submit"
        disabled={loading}
        style={{ padding: '0.875rem', borderRadius: '999px', background: '#4A7C3F', color: '#F5F2E8', fontSize: '1rem', fontFamily: 'Georgia, serif', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.03em', boxShadow: '0 4px 16px rgba(74,124,63,0.2)', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Creando...' : 'Crear código'}
      </button>
    </form>
  )
}
