'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Course = { id: string; title: string }
type Module = { id: string; course_id: string; title: string; description: string | null; position: number }

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return {}
  return { Authorization: `Bearer ${session.access_token}` }
}

export default function EditModuleForm({ module, courses }: { module: Module; courses: Course[] }) {
  const router = useRouter()
  const [courseId, setCourseId] = useState(module.course_id)
  const [title, setTitle] = useState(module.title)
  const [description, setDescription] = useState(module.description || '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const authHeaders = await getAuthHeaders()
    const res = await fetch('/api/admin/modules/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ moduleId: module.id, courseId, title, description }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Error al actualizar módulo')
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => { router.push('/admin/modulos'); router.refresh() }, 1200)
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    border: '1.5px solid rgba(74,124,63,0.3)',
    background: 'rgba(255,255,255,0.7)',
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
          {courses.map((course) => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Título del módulo</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} required />
      </div>

      <div>
        <label style={labelStyle}>Descripción <span style={{ color: '#8B6914', fontSize: '0.75rem' }}>(opcional)</span></label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} />
      </div>

      <div style={{ background: 'rgba(74,124,63,0.06)', border: '1px solid rgba(74,124,63,0.15)', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#4A7C3F' }}>
        Posición actual: <strong>{module.position}</strong>
      </div>

      {error && (
        <div style={{ background: 'rgba(180,60,40,0.08)', border: '1px solid rgba(180,60,40,0.2)', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#8B2500' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'rgba(74,124,63,0.1)', border: '1px solid rgba(74,124,63,0.3)', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#2D5A27' }}>
          ✓ Guardado correctamente, redirigiendo...
        </div>
      )}

      <button
        type="submit"
        disabled={loading || success}
        style={{ padding: '0.875rem', borderRadius: '999px', background: success ? '#4A7C3F' : loading ? '#7aaa6f' : '#4A7C3F', color: '#F5F2E8', fontSize: '1rem', fontFamily: 'Georgia, serif', border: 'none', cursor: (loading || success) ? 'not-allowed' : 'pointer', letterSpacing: '0.03em', boxShadow: '0 4px 16px rgba(74,124,63,0.2)' }}
      >
        {success ? '✓ Guardado' : loading ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
