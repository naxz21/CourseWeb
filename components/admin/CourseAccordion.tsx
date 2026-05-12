'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Course = {
  id: string
  title: string
  slug: string
}

interface Props {
  course: Course
  moduleCount: number
  lessonCount: number
  existingModules: { id: string; position: number; course_id: string }[]
  children: React.ReactNode
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return {}
  return { Authorization: `Bearer ${session.access_token}` }
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.65rem 1rem', borderRadius: '0.75rem',
  border: '1.5px solid rgba(74,124,63,0.3)', background: 'rgba(255,255,255,0.85)',
  color: '#2C2C2C', fontSize: '0.875rem', fontFamily: 'Georgia, serif',
  outline: 'none', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem', color: '#4A7C3F', letterSpacing: '0.05em',
  display: 'block', marginBottom: '0.35rem',
}

export default function CourseAccordion({ course, moduleCount, lessonCount, existingModules, children }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [showCreateModule, setShowCreateModule] = useState(false)

  // form state
  const [modTitle, setModTitle]     = useState('')
  const [modDesc, setModDesc]       = useState('')
  const [creating, setCreating]     = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState(false)

  const nextModulePosition = (() => {
    const courseModules = existingModules.filter((m) => m.course_id === course.id)
    if (!courseModules.length) return 1
    return Math.max(...courseModules.map((m) => m.position)) + 1
  })()

  async function handleCreateModule(e: React.FormEvent) {
    e.preventDefault()
    if (!modTitle.trim()) return
    setCreating(true)
    setCreateError('')
    setCreateSuccess(false)

    try {
      const authHeaders = await getAuthHeaders()
      const res = await fetch('/api/admin/modules/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ courseId: course.id, title: modTitle.trim(), description: modDesc.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear módulo')
      setModTitle(''); setModDesc('')
      setCreateSuccess(true)
      setTimeout(() => { setCreateSuccess(false); setShowCreateModule(false) }, 2000)
      router.refresh()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error al crear módulo')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.65)',
      border: '1.5px solid rgba(74,124,63,0.22)',
      borderRadius: '1.25rem',
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(74,124,63,0.07)',
    }}>
      {/* ── Cabecera del curso ── */}
      <div style={{
        padding: '1.1rem 1.5rem', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
        background: open ? 'rgba(74,124,63,0.05)' : 'transparent', transition: 'background 0.2s',
      }}>
        <button type="button" onClick={() => setOpen(!open)}
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', flex: 1, padding: 0 }}>
          <span style={{ width: '36px', height: '36px', borderRadius: '0.6rem', background: 'rgba(74,124,63,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
            📚
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '400', color: '#2D5A27', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {course.title}
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#8B6914', margin: '0.15rem 0 0' }}>/{course.slug}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '0.72rem', color: '#4A7C3F', background: 'rgba(74,124,63,0.1)', padding: '0.2rem 0.6rem', borderRadius: '999px', whiteSpace: 'nowrap' }}>
              {moduleCount} {moduleCount === 1 ? 'módulo' : 'módulos'}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#8B6914', background: 'rgba(139,105,20,0.1)', padding: '0.2rem 0.6rem', borderRadius: '999px', whiteSpace: 'nowrap' }}>
              {lessonCount} {lessonCount === 1 ? 'lección' : 'lecciones'}
            </span>
            <span style={{ fontSize: '1rem', color: '#4A7C3F', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block', marginLeft: '0.25rem' }}>▾</span>
          </div>
        </button>
        <Link href={`/admin/cursos/${course.id}`}
          style={{ padding: '0.4rem 1rem', borderRadius: '999px', border: '1.5px solid rgba(74,124,63,0.4)', color: '#4A7C3F', fontSize: '0.78rem', textDecoration: 'none', flexShrink: 0 }}>
          Editar curso
        </Link>
      </div>

      {/* ── Contenido expandible ── */}
      {open && (
        <div style={{ padding: '1rem 1.5rem 1.25rem', borderTop: '1px solid rgba(74,124,63,0.1)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          {/* Módulos hijos */}
          {children}

          {/* Crear módulo inline */}
          {!showCreateModule ? (
            <button type="button" onClick={() => setShowCreateModule(true)}
              style={{ padding: '0.6rem 1.25rem', borderRadius: '999px', border: '1.5px dashed rgba(74,124,63,0.4)', color: '#4A7C3F', background: 'transparent', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Georgia, serif', alignSelf: 'flex-start', marginTop: '0.25rem' }}>
              + Crear módulo en este curso
            </button>
          ) : (
            <form onSubmit={handleCreateModule}
              style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <p style={{ fontSize: '0.8rem', color: '#4A7C3F', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Nuevo módulo — {course.title}
              </p>

              <div>
                <label style={labelStyle}>Título del módulo</label>
                <input type="text" placeholder="Ej: Introducción a la fermentación" value={modTitle} onChange={(e) => setModTitle(e.target.value)} style={inputStyle} required autoFocus />
              </div>

              <div>
                <label style={labelStyle}>Descripción <span style={{ color: '#8B6914' }}>(opcional)</span></label>
                <textarea placeholder="Descripción del módulo..." value={modDesc} onChange={(e) => setModDesc(e.target.value)} style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} />
              </div>

              <div style={{ background: 'rgba(74,124,63,0.06)', border: '1px solid rgba(74,124,63,0.15)', borderRadius: '0.5rem', padding: '0.5rem 0.85rem', fontSize: '0.8rem', color: '#4A7C3F' }}>
                Posición asignada: <strong>{nextModulePosition}</strong>
              </div>

              {createError && <p style={{ fontSize: '0.8rem', color: '#8B2500', background: 'rgba(180,60,40,0.08)', border: '1px solid rgba(180,60,40,0.2)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', margin: 0 }}>{createError}</p>}
              {createSuccess && <p style={{ fontSize: '0.8rem', color: '#2D5A27', background: 'rgba(74,124,63,0.1)', border: '1px solid rgba(74,124,63,0.3)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', margin: 0 }}>✓ Módulo creado correctamente</p>}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" disabled={creating || createSuccess}
                  style={{ padding: '0.6rem 1.5rem', borderRadius: '999px', background: '#4A7C3F', color: '#F5F2E8', fontSize: '0.875rem', border: 'none', cursor: (creating || createSuccess) ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', opacity: creating ? 0.7 : 1, boxShadow: '0 4px 12px rgba(74,124,63,0.2)' }}>
                  {createSuccess ? '✓ Creado' : creating ? 'Creando...' : 'Crear módulo'}
                </button>
                <button type="button" onClick={() => { setShowCreateModule(false); setModTitle(''); setModDesc(''); setCreateError('') }}
                  style={{ padding: '0.6rem 1.25rem', borderRadius: '999px', border: '1.5px solid rgba(74,124,63,0.3)', color: '#5C5C4A', background: 'transparent', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
