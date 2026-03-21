'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DeleteLessonAssetButton from '@/components/admin/DeleteLessonAssetButton'

type Module = {
  id: string
  title: string
  courses?: { title: string } | { title: string }[]
}

type Asset = {
  id: string
  asset_type: 'video' | 'pdf' | 'image'
  title: string | null
  file_url: string
  position: number
}

type Lesson = {
  id: string
  module_id: string
  title: string
  lesson_type: string
  content: string | null
  cover_image_url?: string | null
  cover_storage_bucket?: string | null
  cover_storage_path?: string | null
  position: number
  lesson_assets?: Asset[]
}

async function parseJsonSafely(res: Response) {
  const text = await res.text()
  try { return JSON.parse(text) } catch { throw new Error(text || 'El servidor devolvió una respuesta inválida') }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return {}
  return { Authorization: `Bearer ${session.access_token}` }
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

const sectionStyle = {
  background: 'rgba(255,255,255,0.6)',
  border: '1px solid rgba(74,124,63,0.2)',
  borderRadius: '1rem',
  padding: '1.25rem',
}

export default function EditLessonForm({ lesson, modules }: { lesson: Lesson; modules: Module[] }) {
  const router = useRouter()

  const [moduleId, setModuleId] = useState(lesson.module_id)
  const [title, setTitle] = useState(lesson.title)
  const [lessonType, setLessonType] = useState<'mixed' | 'text'>(lesson.lesson_type === 'text' ? 'text' : 'mixed')
  const [content, setContent] = useState(lesson.content || '')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [pdfFiles, setPdfFiles] = useState<File[]>([])
  const [videoFiles, setVideoFiles] = useState<File[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const existingAssets = Array.isArray(lesson.lesson_assets)
    ? [...lesson.lesson_assets].sort((a, b) => a.position - b.position)
    : []

  async function uploadFiles(files: File[], assetType: 'video' | 'pdf' | 'image' | 'cover', lessonId: string) {
    if (!files.length) return []
    const authHeaders = await getAuthHeaders()
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    formData.append('assetType', assetType)
    formData.append('lessonId', lessonId)
    const res = await fetch('/api/admin/lesson-assets/upload', { method: 'POST', headers: authHeaders, body: formData })
    const data = await parseJsonSafely(res)
    if (!res.ok) throw new Error(data.error || `Error al subir archivos de tipo ${assetType}`)
    return data.files as Array<{ publicUrl: string; storageBucket: string; storagePath: string; originalName: string }>
  }

  async function uploadCover(lessonId: string) {
    if (!coverFile) return { coverImageUrl: lesson.cover_image_url || null, coverStorageBucket: lesson.cover_storage_bucket || null, coverStoragePath: lesson.cover_storage_path || null }
    const data = await uploadFiles([coverFile], 'cover', lessonId)
    return { coverImageUrl: data[0]?.publicUrl || null, coverStorageBucket: data[0]?.storageBucket || null, coverStoragePath: data[0]?.storagePath || null }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const authHeaders = await getAuthHeaders()
      const cover = await uploadCover(lesson.id)

      const updateRes = await fetch('/api/admin/lessons/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ lessonId: lesson.id, moduleId, title, lessonType, content, coverImageUrl: cover.coverImageUrl, coverStorageBucket: cover.coverStorageBucket, coverStoragePath: cover.coverStoragePath }),
      })
      const updateData = await parseJsonSafely(updateRes)
      if (!updateRes.ok) throw new Error(updateData.error || 'Error al actualizar lección')

      const newAssets: any[] = []
      const uploadedPdfs = await uploadFiles(pdfFiles, 'pdf', lesson.id)
      uploadedPdfs.forEach((file, index) => newAssets.push({ assetType: 'pdf', title: file.originalName, fileUrl: file.publicUrl, storageBucket: file.storageBucket, storagePath: file.storagePath, position: existingAssets.length + index + 1 }))
      const uploadedVideos = await uploadFiles(videoFiles, 'video', lesson.id)
      uploadedVideos.forEach((file, index) => newAssets.push({ assetType: 'video', title: file.originalName, fileUrl: file.publicUrl, storageBucket: file.storageBucket, storagePath: file.storagePath, position: existingAssets.length + uploadedPdfs.length + index + 1 }))
      const uploadedImages = await uploadFiles(imageFiles, 'image', lesson.id)
      uploadedImages.forEach((file, index) => newAssets.push({ assetType: 'image', title: file.originalName, fileUrl: file.publicUrl, storageBucket: file.storageBucket, storagePath: file.storagePath, position: existingAssets.length + uploadedPdfs.length + uploadedVideos.length + index + 1 }))

      if (newAssets.length > 0) {
        const assetsRes = await fetch('/api/admin/lesson-assets/create-many', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify({ lessonId: lesson.id, assets: newAssets }) })
        const assetsData = await parseJsonSafely(assetsRes)
        if (!assetsRes.ok) throw new Error(assetsData.error || 'Error al guardar nuevos archivos')
      }

      setSuccess(true)
      setTimeout(() => { router.push('/admin/lecciones'); router.refresh() }, 1200)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar lección')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontFamily: 'Georgia, serif' }}>

      <div>
        <label style={labelStyle}>Módulo</label>
        <select value={moduleId} onChange={(e) => setModuleId(e.target.value)} style={inputStyle} required>
          {modules.map((module) => {
            const course = Array.isArray(module.courses) ? module.courses[0] : module.courses
            return <option key={module.id} value={module.id}>{course?.title ? `${course.title} / ${module.title}` : module.title}</option>
          })}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Título</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} required />
      </div>

      <div>
        <label style={labelStyle}>Tipo de lección</label>
        <select value={lessonType} onChange={(e) => setLessonType(e.target.value as 'mixed' | 'text')} style={inputStyle}>
          <option value="mixed">Lección multimedia</option>
          <option value="text">Solo texto</option>
        </select>
      </div>

      <div>
        <label style={labelStyle}>Contenido / descripción <span style={{ color: '#8B6914', fontSize: '0.75rem' }}>(opcional)</span></label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} />
      </div>

      {/* Portada */}
      <div style={sectionStyle}>
        <p style={{ ...labelStyle, marginBottom: '0.75rem' }}>Portada actual / nueva</p>
        {lesson.cover_image_url && !coverFile && (
          <img src={lesson.cover_image_url} alt={lesson.title} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '0.75rem', marginBottom: '0.75rem', border: '1px solid rgba(74,124,63,0.15)' }} />
        )}
        {coverFile && (
          <img src={URL.createObjectURL(coverFile)} alt="Preview" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '0.75rem', marginBottom: '0.75rem', border: '1px solid rgba(74,124,63,0.15)' }} />
        )}
        <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          style={{ width: '100%', padding: '0.6rem', borderRadius: '0.75rem', border: '1px solid rgba(74,124,63,0.2)', background: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', color: '#2C2C2C', boxSizing: 'border-box' as const }} />
      </div>

      {/* Archivos actuales */}
      <div style={sectionStyle}>
        <p style={{ ...labelStyle, marginBottom: '0.75rem' }}>Archivos actuales</p>
        {existingAssets.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {existingAssets.map((asset) => (
              <div key={asset.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'rgba(245,242,232,0.8)', border: '1px solid rgba(74,124,63,0.15)', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#2D5A27', margin: 0 }}>{asset.title || 'Archivo'}</p>
                  <span style={{ fontSize: '0.7rem', color: '#8B6914', background: 'rgba(139,105,20,0.1)', padding: '0.1rem 0.5rem', borderRadius: '999px' }}>{asset.asset_type}</span>
                </div>
                <DeleteLessonAssetButton assetId={asset.id} />
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.875rem', color: '#5C5C4A', fontStyle: 'italic' }}>No hay archivos cargados todavía.</p>
        )}
      </div>

      {/* Nuevos PDFs */}
      <div style={sectionStyle}>
        <p style={{ ...labelStyle, marginBottom: '0.75rem' }}>Agregar nuevos PDFs</p>
        <input type="file" accept=".pdf,application/pdf" multiple onChange={(e) => setPdfFiles(Array.from(e.target.files || []))}
          style={{ width: '100%', padding: '0.6rem', borderRadius: '0.75rem', border: '1px solid rgba(74,124,63,0.2)', background: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', color: '#2C2C2C', boxSizing: 'border-box' as const }} />
        {pdfFiles.length > 0 && <p style={{ fontSize: '0.75rem', color: '#4A7C3F', marginTop: '0.4rem' }}>{pdfFiles.length} archivo(s) seleccionado(s)</p>}
      </div>

      {/* Nuevos videos */}
      <div style={sectionStyle}>
        <p style={{ ...labelStyle, marginBottom: '0.75rem' }}>Agregar nuevos videos</p>
        <input type="file" accept="video/*" multiple onChange={(e) => setVideoFiles(Array.from(e.target.files || []))}
          style={{ width: '100%', padding: '0.6rem', borderRadius: '0.75rem', border: '1px solid rgba(74,124,63,0.2)', background: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', color: '#2C2C2C', boxSizing: 'border-box' as const }} />
        {videoFiles.length > 0 && <p style={{ fontSize: '0.75rem', color: '#4A7C3F', marginTop: '0.4rem' }}>{videoFiles.length} archivo(s) seleccionado(s)</p>}
      </div>

      {/* Nuevas imágenes */}
      <div style={sectionStyle}>
        <p style={{ ...labelStyle, marginBottom: '0.75rem' }}>Agregar nuevas imágenes</p>
        <input type="file" accept="image/*" multiple onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
          style={{ width: '100%', padding: '0.6rem', borderRadius: '0.75rem', border: '1px solid rgba(74,124,63,0.2)', background: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', color: '#2C2C2C', boxSizing: 'border-box' as const }} />
        {imageFiles.length > 0 && <p style={{ fontSize: '0.75rem', color: '#4A7C3F', marginTop: '0.4rem' }}>{imageFiles.length} archivo(s) seleccionado(s)</p>}
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
        style={{ padding: '0.875rem', borderRadius: '999px', background: '#4A7C3F', color: '#F5F2E8', fontSize: '1rem', fontFamily: 'Georgia, serif', border: 'none', cursor: (loading || success) ? 'not-allowed' : 'pointer', letterSpacing: '0.03em', boxShadow: '0 4px 16px rgba(74,124,63,0.2)', opacity: loading ? 0.7 : 1 }}
      >
        {success ? '✓ Guardado' : loading ? 'Guardando cambios...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
