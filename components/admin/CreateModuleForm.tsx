'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Course = { id: string; title: string }
type Module = { id: string; title: string; course_id: string; position: number }

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return {}
  return { Authorization: `Bearer ${session.access_token}` }
}

export default function CreateModuleForm({
  courses,
  existingModules = [],
}: {
  courses: Course[]
  existingModules?: Module[]
}) {
  const router = useRouter()
  const [courseId, setCourseId] = useState(courses[0]?.id || '')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const nextPosition = useMemo(() => {
    const modulesOfCourse = existingModules.filter((m) => m.course_id === courseId)
    if (modulesOfCourse.length === 0) return 1
    return Math.max(...modulesOfCourse.map((m) => Number(m.position) || 0)) + 1
  }, [existingModules, courseId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const authHeaders = await getAuthHeaders()
    const res = await fetch('/api/admin/modules/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ courseId, title, description }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Error al crear módulo')
      setLoading(false)
      return
    }

    setTitle('')
    setDescription('')
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
        <input type="text" placeholder="Ej: Introducción a la fermentación" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} required />
      </div>

      <div>
        <label style={labelStyle}>Descripción <span style={{ color: '#8B6914', fontSize: '0.75rem' }}>(opcional)</span></label>
        <textarea placeholder="Descripción del módulo..." value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} />
      </div>

      <div style={{ background: 'rgba(74,124,63,0.06)', border: '1px solid rgba(74,124,63,0.15)', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#4A7C3F' }}>
        Posición asignada automáticamente: <strong>{nextPosition}</strong>
      </div>

      {error && (
        <div style={{ background: 'rgba(180,60,40,0.08)', border: '1px solid rgba(180,60,40,0.2)', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#8B2500' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'rgba(74,124,63,0.1)', border: '1px solid rgba(74,124,63,0.3)', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#2D5A27', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ✓ Módulo creado correctamente
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{ padding: '0.875rem', borderRadius: '999px', background: loading ? '#7aaa6f' : '#4A7C3F', color: '#F5F2E8', fontSize: '1rem', fontFamily: 'Georgia, serif', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.03em', boxShadow: '0 4px 16px rgba(74,124,63,0.2)', transition: 'background 0.2s' }}
      >
        {loading ? 'Creando módulo...' : 'Crear módulo'}
      </button>
    </form>
  )
}
