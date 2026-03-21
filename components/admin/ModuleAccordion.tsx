'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import DeleteModuleButton from '@/components/admin/DeleteModuleButton'
import MoveModuleButtons from '@/components/admin/MoveModuleButtons'
import DeleteLessonButton from '@/components/admin/DeleteLessonButton'

type Lesson = {
  id: string
  title: string
  position: number
  module_id: string
  cover_image_url?: string | null
  lesson_type: string
}

type Module = {
  id: string
  title: string
  description: string | null
  position: number
  course_id: string
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

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return {}
  return { Authorization: `Bearer ${session.access_token}` }
}

async function parseJsonSafely(res: Response) {
  const text = await res.text()
  try { return JSON.parse(text) } catch { throw new Error(text || 'Respuesta inválida del servidor') }
}

const inputStyle = {
  width: '100%',
  padding: '0.65rem 1rem',
  borderRadius: '0.75rem',
  border: '1.5px solid rgba(74,124,63,0.3)',
  background: 'rgba(255,255,255,0.8)',
  color: '#2C2C2C',
  fontSize: '0.875rem',
  fontFamily: 'Georgia, serif',
  outline: 'none',
  boxSizing: 'border-box' as const,
}

const labelStyle = {
  fontSize: '0.75rem',
  color: '#4A7C3F',
  letterSpacing: '0.05em',
  display: 'block' as const,
  marginBottom: '0.35rem',
}

const fileSectionStyle = {
  background: 'rgba(245,242,232,0.8)',
  border: '1px solid rgba(74,124,63,0.15)',
  borderRadius: '0.75rem',
  padding: '1rem',
}

export default function ModuleAccordion({
  module,
  lessons,
}: {
  module: Module
  lessons: Lesson[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [showAddLesson, setShowAddLesson] = useState(false)

  // Campos del formulario
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<'mixed' | 'text'>('mixed')
  const [newContent, setNewContent] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [pdfFiles, setPdfFiles] = useState<File[]>([])
  const [videoFiles, setVideoFiles] = useState<File[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [creating, setCreating] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [createError, setCreateError] = useState('')

  function resetForm() {
    setNewTitle('')
    setNewType('mixed')
    setNewContent('')
    setCoverFile(null)
    setPdfFiles([])
    setVideoFiles([])
    setImageFiles([])
    setCreateError('')
    setCreateSuccess(false)
  }

  async function uploadFiles(files: File[], assetType: 'video' | 'pdf' | 'image' | 'cover', lessonId: string) {
    if (!files.length) return []
    const authHeaders = await getAuthHeaders()
    const formData = new FormData()
    files.forEach((f) => formData.append('files', f))
    formData.append('assetType', assetType)
    formData.append('lessonId', lessonId)
    const res = await fetch('/api/admin/lesson-assets/upload', { method: 'POST', headers: authHeaders, body: formData })
    const data = await parseJsonSafely(res)
    if (!res.ok) throw new Error(data.error || `Error al subir ${assetType}`)
    return data.files as Array<{ publicUrl: string; storageBucket: string; storagePath: string; originalName: string }>
  }

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    setCreateError('')
    setCreateSuccess(false)

    try {
      const authHeaders = await getAuthHeaders()

      // 1. Crear lección
      const createRes = await fetch('/api/admin/lessons/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ moduleId: module.id, title: newTitle.trim(), lessonType: newType, content: newContent }),
      })
      const createData = await parseJsonSafely(createRes)
      if (!createRes.ok) throw new Error(createData.error || 'Error al crear lección')
      const lessonId = createData.lessonId as string

      // 2. Subir portada
      let coverImageUrl: string | null = null
      let coverStorageBucket: string | null = null
      let coverStoragePath: string | null = null
      if (coverFile) {
        const uploaded = await uploadFiles([coverFile], 'cover', lessonId)
        if (uploaded[0]) { coverImageUrl = uploaded[0].publicUrl; coverStorageBucket = uploaded[0].storageBucket; coverStoragePath = uploaded[0].storagePath }
      }

      // 3. Actualizar portada
      await fetch('/api/admin/lessons/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ lessonId, moduleId: module.id, title: newTitle.trim(), lessonType: newType, content: newContent, coverImageUrl, coverStorageBucket, coverStoragePath }),
      })

      // 4. Subir assets
      const allAssets: UploadedAsset[] = []
      const uploadedPdfs = await uploadFiles(pdfFiles, 'pdf', lessonId)
      uploadedPdfs.forEach((f, i) => allAssets.push({ assetType: 'pdf', title: f.originalName, fileUrl: f.publicUrl, storageBucket: f.storageBucket, storagePath: f.storagePath, position: i + 1, originalName: f.originalName }))
      const uploadedVideos = await uploadFiles(videoFiles, 'video', lessonId)
      uploadedVideos.forEach((f, i) => allAssets.push({ assetType: 'video', title: f.originalName, fileUrl: f.publicUrl, storageBucket: f.storageBucket, storagePath: f.storagePath, position: uploadedPdfs.length + i + 1, originalName: f.originalName }))
      const uploadedImages = await uploadFiles(imageFiles, 'image', lessonId)
      uploadedImages.forEach((f, i) => allAssets.push({ assetType: 'image', title: f.originalName, fileUrl: f.publicUrl, storageBucket: f.storageBucket, storagePath: f.storagePath, position: uploadedPdfs.length + uploadedVideos.length + i + 1, originalName: f.originalName }))

      if (allAssets.length > 0) {
        const assetsRes = await fetch('/api/admin/lesson-assets/create-many', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({ lessonId, assets: allAssets }),
        })
        const assetsData = await parseJsonSafely(assetsRes)
        if (!assetsRes.ok) throw new Error(assetsData.error || 'Error al guardar archivos')
      }

      setCreateSuccess(true)
      resetForm()
      setTimeout(() => { setCreateSuccess(false); setShowAddLesson(false) }, 2500)
      router.refresh()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error al crear lección')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={{ background: 'rgba(245,242,232,0.8)', border: '1px solid rgba(74,124,63,0.15)', borderRadius: '1rem', overflow: 'hidden' }}>

      {/* Cabecera */}
      <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', flex: 1, padding: 0 }}>
          <span style={{ fontSize: '0.75rem', color: '#8B6914', minWidth: '24px', fontFamily: 'Georgia, serif' }}>{module.position}.</span>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '400', color: '#2D5A27', margin: 0 }}>{module.title}</h4>
            {module.description && <p style={{ fontSize: '0.8rem', color: '#5C5C4A', margin: '0.1rem 0 0' }}>{module.description}</p>}
          </div>
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#8B6914', background: 'rgba(139,105,20,0.1)', padding: '0.2rem 0.6rem', borderRadius: '999px', whiteSpace: 'nowrap' }}>
            {lessons.length} {lessons.length === 1 ? 'lección' : 'lecciones'}
          </span>
          <span style={{ fontSize: '1rem', color: '#4A7C3F', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
        </button>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <MoveModuleButtons moduleId={module.id} />
          <Link href={`/admin/modulos/${module.id}`} style={{ padding: '0.4rem 1rem', borderRadius: '999px', border: '1.5px solid #4A7C3F', color: '#4A7C3F', fontSize: '0.8rem', textDecoration: 'none' }}>Editar</Link>
          <DeleteModuleButton moduleId={module.id} />
        </div>
      </div>

      {/* Contenido expandible */}
      {open && (
        <div style={{ borderTop: '1px solid rgba(74,124,63,0.1)', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          {/* Lista de lecciones */}
          {lessons.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: '#5C5C4A', fontStyle: 'italic', textAlign: 'center', padding: '0.75rem' }}>Este módulo no tiene lecciones todavía.</p>
          ) : (
            lessons.map((lesson) => (
              <div key={lesson.id} style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(74,124,63,0.15)', borderRadius: '0.75rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                  {lesson.cover_image_url && (
                    <img src={lesson.cover_image_url} alt={lesson.title} style={{ width: '48px', height: '48px', borderRadius: '0.5rem', objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.9rem', color: '#2D5A27', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson.position}. {lesson.title}</p>
                    <span style={{ fontSize: '0.7rem', color: '#8B6914', background: 'rgba(139,105,20,0.1)', padding: '0.1rem 0.5rem', borderRadius: '999px' }}>{lesson.lesson_type}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <Link href={`/admin/lecciones/${lesson.id}/editar`} style={{ padding: '0.35rem 0.9rem', borderRadius: '999px', border: '1.5px solid #4A7C3F', color: '#4A7C3F', fontSize: '0.75rem', textDecoration: 'none' }}>Editar</Link>
                  <DeleteLessonButton lessonId={lesson.id} />
                </div>
              </div>
            ))
          )}

          {/* Formulario agregar lección */}
          {!showAddLesson ? (
            <button type="button" onClick={() => setShowAddLesson(true)} style={{ padding: '0.6rem 1.25rem', borderRadius: '999px', border: '1.5px dashed rgba(74,124,63,0.4)', color: '#4A7C3F', background: 'transparent', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Georgia, serif', alignSelf: 'flex-start' }}>
              + Agregar lección
            </button>
          ) : (
            <form onSubmit={handleCreateLesson} style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '1rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.8rem', color: '#4A7C3F', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Nueva lección — {module.title}</p>

              <div>
                <label style={labelStyle}>Título</label>
                <input type="text" placeholder="Ej: Introducción al kéfir" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={inputStyle} required autoFocus />
              </div>

              <div>
                <label style={labelStyle}>Tipo</label>
                <select value={newType} onChange={(e) => setNewType(e.target.value as 'mixed' | 'text')} style={inputStyle}>
                  <option value="mixed">Multimedia (video, PDF, imágenes)</option>
                  <option value="text">Solo texto</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Descripción <span style={{ color: '#8B6914' }}>(opcional)</span></label>
                <textarea placeholder="Descripción..." value={newContent} onChange={(e) => setNewContent(e.target.value)} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
              </div>

              <div style={fileSectionStyle}>
                <label style={labelStyle}>Imagen de portada</label>
                {coverFile && <img src={URL.createObjectURL(coverFile)} alt="preview" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '0.5rem' }} />}
                <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} style={{ width: '100%', fontSize: '0.8rem', color: '#2C2C2C' }} />
              </div>

              <div style={fileSectionStyle}>
                <label style={labelStyle}>PDFs</label>
                <input type="file" accept=".pdf,application/pdf" multiple onChange={(e) => setPdfFiles(Array.from(e.target.files || []))} style={{ width: '100%', fontSize: '0.8rem', color: '#2C2C2C' }} />
                {pdfFiles.length > 0 && <p style={{ fontSize: '0.75rem', color: '#4A7C3F', marginTop: '0.3rem' }}>{pdfFiles.length} archivo(s)</p>}
              </div>

              <div style={fileSectionStyle}>
                <label style={labelStyle}>Videos</label>
                <input type="file" accept="video/*" multiple onChange={(e) => setVideoFiles(Array.from(e.target.files || []))} style={{ width: '100%', fontSize: '0.8rem', color: '#2C2C2C' }} />
                {videoFiles.length > 0 && <p style={{ fontSize: '0.75rem', color: '#4A7C3F', marginTop: '0.3rem' }}>{videoFiles.length} archivo(s)</p>}
              </div>

              <div style={fileSectionStyle}>
                <label style={labelStyle}>Imágenes</label>
                <input type="file" accept="image/*" multiple onChange={(e) => setImageFiles(Array.from(e.target.files || []))} style={{ width: '100%', fontSize: '0.8rem', color: '#2C2C2C' }} />
                {imageFiles.length > 0 && <p style={{ fontSize: '0.75rem', color: '#4A7C3F', marginTop: '0.3rem' }}>{imageFiles.length} archivo(s)</p>}
              </div>

              {createError && <p style={{ fontSize: '0.8rem', color: '#8B2500', background: 'rgba(180,60,40,0.08)', border: '1px solid rgba(180,60,40,0.2)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', margin: 0 }}>{createError}</p>}
              {createSuccess && <p style={{ fontSize: '0.8rem', color: '#2D5A27', background: 'rgba(74,124,63,0.1)', border: '1px solid rgba(74,124,63,0.3)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', margin: 0 }}>✓ Lección creada correctamente</p>}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" disabled={creating || createSuccess} style={{ padding: '0.65rem 1.5rem', borderRadius: '999px', background: '#4A7C3F', color: '#F5F2E8', fontSize: '0.875rem', border: 'none', cursor: (creating || createSuccess) ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', opacity: creating ? 0.7 : 1, boxShadow: '0 4px 12px rgba(74,124,63,0.2)' }}>
                  {createSuccess ? '✓ Creada' : creating ? 'Creando...' : 'Crear lección'}
                </button>
                <button type="button" onClick={() => { setShowAddLesson(false); resetForm() }} style={{ padding: '0.65rem 1.25rem', borderRadius: '999px', border: '1.5px solid rgba(74,124,63,0.3)', color: '#5C5C4A', background: 'transparent', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
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
