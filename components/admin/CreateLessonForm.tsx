'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Module = {
  id: string
  title: string
  courses?: { title: string } | { title: string }[]
}

type Lesson = {
  id: string
  module_id: string
  position: number
}

type UploadedAsset = {
  assetType: 'video' | 'pdf' | 'image'
  title: string
  fileUrl: string
  storageBucket: string
  storagePath: string
  position: number
  originalName: string
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

const fileInputStyle = {
  width: '100%',
  padding: '0.6rem',
  borderRadius: '0.75rem',
  border: '1px solid rgba(74,124,63,0.2)',
  background: 'rgba(255,255,255,0.6)',
  fontSize: '0.85rem',
  color: '#2C2C2C',
  boxSizing: 'border-box' as const,
}

export default function CreateLessonForm({
  modules,
  existingLessons = [],
}: {
  modules: Module[]
  existingLessons?: Lesson[]
}) {
  const router = useRouter()

  const [moduleId, setModuleId] = useState(modules[0]?.id || '')
  const [title, setTitle] = useState('')
  const [lessonType, setLessonType] = useState<'mixed' | 'text'>('mixed')
  const [content, setContent] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [pdfFiles, setPdfFiles] = useState<File[]>([])
  const [videoFiles, setVideoFiles] = useState<File[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const nextPosition = useMemo(() => {
    const lessonsOfModule = existingLessons.filter((l) => l.module_id === moduleId)
    if (lessonsOfModule.length === 0) return 1
    return Math.max(...lessonsOfModule.map((l) => Number(l.position) || 0)) + 1
  }, [existingLessons, moduleId])

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    let createdLessonId: string | null = null

    try {
      const authHeaders = await getAuthHeaders()

      const createRes = await fetch('/api/admin/lessons/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ moduleId, title, lessonType, content }),
      })
      const createData = await parseJsonSafely(createRes)
      if (!createRes.ok) throw new Error(createData.error || 'Error al crear lección')

      createdLessonId = createData.lessonId as string
      const lessonId = createdLessonId

      let coverImageUrl: string | null = null
      let coverStorageBucket: string | null = null
      let coverStoragePath: string | null = null

      if (coverFile) {
        const uploadedCover = await uploadFiles([coverFile], 'cover', lessonId)
        if (uploadedCover[0]) {
          coverImageUrl = uploadedCover[0].publicUrl
          coverStorageBucket = uploadedCover[0].storageBucket
          coverStoragePath = uploadedCover[0].storagePath
        }
      }

      const allAssets: UploadedAsset[] = []
      const uploadedPdfs = await uploadFiles(pdfFiles, 'pdf', lessonId)
      uploadedPdfs.forEach((file, index) => allAssets.push({ assetType: 'pdf', title: file.originalName, fileUrl: file.publicUrl, storageBucket: file.storageBucket, storagePath: file.storagePath, position: index + 1, originalName: file.originalName }))
      const uploadedVideos = await uploadFiles(videoFiles, 'video', lessonId)
      uploadedVideos.forEach((file, index) => allAssets.push({ assetType: 'video', title: file.originalName, fileUrl: file.publicUrl, storageBucket: file.storageBucket, storagePath: file.storagePath, position: uploadedPdfs.length + index + 1, originalName: file.originalName }))
      const uploadedImages = await uploadFiles(imageFiles, 'image', lessonId)
      uploadedImages.forEach((file, index) => allAssets.push({ assetType: 'image', title: file.originalName, fileUrl: file.publicUrl, storageBucket: file.storageBucket, storagePath: file.storagePath, position: uploadedPdfs.length + uploadedVideos.length + index + 1, originalName: file.originalName }))

      const updateRes = await fetch('/api/admin/lessons/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ lessonId, moduleId, title, lessonType, content, coverImageUrl, coverStorageBucket, coverStoragePath }),
      })
      const updateData = await parseJsonSafely(updateRes)
      if (!updateRes.ok) throw new Error(updateData.error || 'Error al actualizar portada')

      if (allAssets.length > 0) {
        const assetsRes = await fetch('/api/admin/lesson-assets/create-many', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({ lessonId, assets: allAssets }),
        })
        const assetsData = await parseJsonSafely(assetsRes)
        if (!assetsRes.ok) throw new Error(assetsData.error || 'Error al guardar archivos')
      }

      setTitle('')
      setContent('')
      setLessonType('mixed')
      setCoverFile(null)
      setPdfFiles([])
      setVideoFiles([])
      setImageFiles([])
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      router.refresh()
    } catch (err) {
      if (createdLessonId) {
        try {
          const authHeaders = await getAuthHeaders()
          await fetch('/api/admin/lessons/delete', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify({ lessonId: createdLessonId }) })
        } catch {}
      }
      setError(err instanceof Error ? err.message : 'Error al crear lección')
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
        <label style={labelStyle}>Título de la lección</label>
        <input type="text" placeholder="Ej: Introducción al kéfir" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} required />
      </div>

      <div>
        <label style={labelStyle}>Tipo de lección</label>
        <select value={lessonType} onChange={(e) => setLessonType(e.target.value as 'mixed' | 'text')} style={inputStyle}>
          <option value="mixed">Multimedia (video, PDF, imágenes)</option>
          <option value="text">Solo texto</option>
        </select>
      </div>

      <div>
        <label style={labelStyle}>Contenido / descripción <span style={{ color: '#8B6914', fontSize: '0.75rem' }}>(opcional)</span></label>
        <textarea placeholder="Descripción de la lección..." value={content} onChange={(e) => setContent(e.target.value)} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} />
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Imagen principal de la lección</label>
        {coverFile && (
          <img src={URL.createObjectURL(coverFile)} alt="Preview" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '0.75rem', marginBottom: '0.75rem', border: '1px solid rgba(74,124,63,0.15)' }} />
        )}
        <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} style={fileInputStyle} />
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>PDFs de la lección</label>
        <input type="file" accept=".pdf,application/pdf" multiple onChange={(e) => setPdfFiles(Array.from(e.target.files || []))} style={fileInputStyle} />
        {pdfFiles.length > 0 && <p style={{ fontSize: '0.75rem', color: '#4A7C3F', marginTop: '0.4rem' }}>{pdfFiles.length} archivo(s) seleccionado(s)</p>}
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Videos de la lección</label>
        <input type="file" accept="video/*" multiple onChange={(e) => setVideoFiles(Array.from(e.target.files || []))} style={fileInputStyle} />
        {videoFiles.length > 0 && <p style={{ fontSize: '0.75rem', color: '#4A7C3F', marginTop: '0.4rem' }}>{videoFiles.length} archivo(s) seleccionado(s)</p>}
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Imágenes internas de la lección</label>
        <input type="file" accept="image/*" multiple onChange={(e) => setImageFiles(Array.from(e.target.files || []))} style={fileInputStyle} />
        {imageFiles.length > 0 && <p style={{ fontSize: '0.75rem', color: '#4A7C3F', marginTop: '0.4rem' }}>{imageFiles.length} archivo(s) seleccionado(s)</p>}
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
        <div style={{ background: 'rgba(74,124,63,0.1)', border: '1px solid rgba(74,124,63,0.3)', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#2D5A27' }}>
          ✓ Lección creada correctamente
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{ padding: '0.875rem', borderRadius: '999px', background: loading ? '#7aaa6f' : '#4A7C3F', color: '#F5F2E8', fontSize: '1rem', fontFamily: 'Georgia, serif', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.03em', boxShadow: '0 4px 16px rgba(74,124,63,0.2)', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Creando lección...' : 'Crear lección'}
      </button>
    </form>
  )
}
