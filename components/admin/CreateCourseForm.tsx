'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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

export default function CreateCourseForm() {
  const router = useRouter()

  const [title, setTitle]           = useState('')
  const [slug, setSlug]             = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice]           = useState('')
  const [published, setPublished]   = useState(false)
  const [coverFile, setCoverFile]   = useState<File | null>(null)
  const [loading, setLoading]       = useState(false)
  const [success, setSuccess]       = useState(false)
  const [error, setError]           = useState('')

  async function uploadCoverImage(file: File): Promise<string | null> {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null
    const ext = file.name.split('.').pop()
    const path = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('course-covers').upload(path, file, { contentType: file.type, upsert: false })
    if (error) { setError('Error al subir imagen: ' + error.message); return null }
    return supabase.storage.from('course-covers').getPublicUrl(path).data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    let coverImageUrl: string | null = null
    if (coverFile) {
      coverImageUrl = await uploadCoverImage(coverFile)
      if (!coverImageUrl) { setLoading(false); return }
    }

    const authHeaders = await getAuthHeaders()
    const res = await fetch('/api/admin/courses/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ title, slug, description, price: Number(price), published, cover_image_url: coverImageUrl }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Error al crear curso'); setLoading(false); return }

    setTitle(''); setSlug(''); setDescription(''); setPrice(''); setPublished(false); setCoverFile(null)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
    router.refresh()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontFamily: 'Georgia, serif' }}>

      <div>
        <label style={labelStyle}>Título del curso</label>
        <input type="text" placeholder="Ej: El arte de fermentar" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} required />
      </div>

      <div>
        <label style={labelStyle}>Slug <span style={{ color: '#8B6914', fontSize: '0.72rem' }}>(URL amigable)</span></label>
        <input type="text" placeholder="ej: fermentacion-basica" value={slug} onChange={(e) => setSlug(e.target.value)} style={inputStyle} required />
      </div>

      <div>
        <label style={labelStyle}>Descripción <span style={{ color: '#8B6914', fontSize: '0.72rem' }}>(opcional)</span></label>
        <textarea placeholder="Descripción del curso..." value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} />
      </div>

      <div>
        <label style={labelStyle}>Precio (ARS)</label>
        <input type="number" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)} style={inputStyle} min="0" required />
      </div>

      <div style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '0.75rem', padding: '1rem' }}>
        <label style={labelStyle}>Imagen de portada</label>
        {coverFile && (
          <img src={URL.createObjectURL(coverFile)} alt="preview" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '0.75rem', border: '1px solid rgba(74,124,63,0.15)' }} />
        )}
        <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          style={{ width: '100%', fontSize: '0.85rem', color: '#2C2C2C' }} />
        {coverFile && <p style={{ fontSize: '0.75rem', color: '#4A7C3F', marginTop: '0.3rem' }}>{coverFile.name}</p>}
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', color: '#2C2C2C', cursor: 'pointer' }}>
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} style={{ width: '1rem', height: '1rem', accentColor: '#4A7C3F' }} />
        Publicar inmediatamente
      </label>

      {error && <p style={{ fontSize: '0.85rem', color: '#8B2500', background: 'rgba(180,60,40,0.08)', border: '1px solid rgba(180,60,40,0.2)', borderRadius: '0.75rem', padding: '0.6rem 1rem', margin: 0 }}>{error}</p>}
      {success && <p style={{ fontSize: '0.85rem', color: '#2D5A27', background: 'rgba(74,124,63,0.1)', border: '1px solid rgba(74,124,63,0.3)', borderRadius: '0.75rem', padding: '0.6rem 1rem', margin: 0 }}>✓ Curso creado correctamente</p>}

      <button type="submit" disabled={loading}
        style={{ padding: '0.875rem', borderRadius: '999px', background: '#4A7C3F', color: '#F5F2E8', fontSize: '1rem', fontFamily: 'Georgia, serif', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.03em', boxShadow: '0 4px 16px rgba(74,124,63,0.2)', opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Creando curso...' : 'Crear curso'}
      </button>
    </form>
  )
}
