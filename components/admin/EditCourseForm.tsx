'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Course = {
  id: string
  title: string
  slug: string
  description: string | null
  price: number
  published: boolean
  cover_image_url?: string | null
  cover_aspect_ratio?: '9:16' | '4:3' | null
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return {}
  return { Authorization: `Bearer ${session.access_token}` }
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem',
  border: '1.5px solid rgba(74,124,63,0.3)', background: 'rgba(255,255,255,0.8)',
  color: '#2C2C2C', fontSize: '0.9rem', fontFamily: 'Georgia, serif',
  outline: 'none', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.8rem', color: '#4A7C3F', letterSpacing: '0.05em',
  display: 'block', marginBottom: '0.4rem',
}

export default function EditCourseForm({ course }: { course: Course }) {
  const router = useRouter()

  const [title, setTitle]             = useState(course.title)
  const [slug, setSlug]               = useState(course.slug)
  const [description, setDescription] = useState(course.description || '')
  const [price, setPrice]             = useState(String(course.price))
  const [published, setPublished]     = useState(course.published)
  const [coverFile, setCoverFile]     = useState<File | null>(null)
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '4:3'>(course.cover_aspect_ratio ?? '9:16')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const previewHeight = aspectRatio === '9:16' ? '220px' : '140px'

  async function uploadCoverImage(file: File): Promise<string | null> {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `covers/${aspectRatio.replace(':', 'x')}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage
      .from('course-covers')
      .upload(path, file, { contentType: file.type, upsert: false })

    if (error) {
      setError('Error al subir imagen: ' + error.message)
      return null
    }

    const { data } = supabase.storage.from('course-covers').getPublicUrl(path)
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    let coverImageUrl: string | null = course.cover_image_url || null

    if (coverFile) {
      const uploaded = await uploadCoverImage(coverFile)
      if (!uploaded) {
        setLoading(false)
        return
      }
      coverImageUrl = uploaded
    }

    const authHeaders = await getAuthHeaders()
    const res = await fetch('/api/admin/courses/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        courseId: course.id,
        title,
        slug,
        description,
        price: Number(price),
        published,
        cover_image_url: coverImageUrl,
        cover_aspect_ratio: aspectRatio,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Error al actualizar curso')
      setLoading(false)
      return
    }

    router.push('/admin/cursos')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontFamily: 'Georgia, serif' }}>

      <div>
        <label style={labelStyle}>Título del curso</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
          required
        />
      </div>

      <div>
        <label style={labelStyle}>Slug <span style={{ color: '#8B6914', fontSize: '0.72rem' }}>(URL amigable)</span></label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          style={inputStyle}
          required
        />
      </div>

      <div>
        <label style={labelStyle}>Descripción <span style={{ color: '#8B6914', fontSize: '0.72rem' }}>(opcional)</span></label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
        />
      </div>

      <div>
        <label style={labelStyle}>Precio (ARS)</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={inputStyle}
          min="0"
          required
        />
      </div>

      <div style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <label style={labelStyle}>Imagen de portada del curso</label>

        {/* Selector de relación de aspecto */}
        <div>
          <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Relación de aspecto</label>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {(['9:16', '4:3'] as const).map((ratio) => (
              <label key={ratio} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: aspectRatio === ratio ? '#2D5A27' : '#5C5C4A', fontWeight: aspectRatio === ratio ? '600' : '400' }}>
                <input
                  type="radio"
                  value={ratio}
                  checked={aspectRatio === ratio}
                  onChange={(e) => setAspectRatio(e.target.value as '9:16' | '4:3')}
                  style={{ width: '1rem', height: '1rem', accentColor: '#4A7C3F' }}
                />
                {ratio === '9:16' ? 'Vertical (9:16)' : 'Horizontal (4:3)'}
              </label>
            ))}
          </div>
        </div>

        {/* Preview — muestra imagen actual o nuevo archivo */}
        {course.cover_image_url && !coverFile && (
          <img
            src={course.cover_image_url}
            alt={course.title}
            style={{ width: '100%', height: previewHeight, objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid rgba(74,124,63,0.15)', transition: 'height 0.2s ease' }}
          />
        )}
        {coverFile && (
          <img
            src={URL.createObjectURL(coverFile)}
            alt="Preview"
            style={{ width: '100%', height: previewHeight, objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid rgba(74,124,63,0.15)', transition: 'height 0.2s ease' }}
          />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          style={{ width: '100%', fontSize: '0.85rem', color: '#2C2C2C' }}
        />
        <p style={{ fontSize: '0.75rem', color: '#5C5C4A', margin: 0 }}>
          {coverFile ? `Nueva imagen: ${coverFile.name}` : 'Subí una nueva imagen para reemplazar la actual'}
        </p>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', color: '#2C2C2C', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          style={{ width: '1rem', height: '1rem', accentColor: '#4A7C3F' }}
        />
        Publicado
      </label>

      {error && <p style={{ fontSize: '0.85rem', color: '#8B2500', background: 'rgba(180,60,40,0.08)', border: '1px solid rgba(180,60,40,0.2)', borderRadius: '0.75rem', padding: '0.6rem 1rem', margin: 0 }}>{error}</p>}

      <button
        type="submit"
        disabled={loading}
        style={{ padding: '0.875rem', borderRadius: '999px', background: '#4A7C3F', color: '#F5F2E8', fontSize: '1rem', fontFamily: 'Georgia, serif', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.03em', boxShadow: '0 4px 16px rgba(74,124,63,0.2)', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Guardando cambios...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
