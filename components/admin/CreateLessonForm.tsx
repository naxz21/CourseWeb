'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { extractGDriveFileId } from '@/lib/gdrive'
import MuxUploadSection from '@/components/admin/MuxUploadSection'

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

// ─── Sección colapsable ───────────────────────────────────────────────────────
function Section({ title, badge, children, defaultOpen = false }: {
  title: string; badge?: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ border: '1px solid rgba(74,124,63,0.2)', borderRadius: '1rem', overflow: 'hidden' }}>
      <button type="button" onClick={() => setOpen(!open)}
        style={{ width: '100%', padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(245,242,232,0.8)', border: 'none', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
        <span style={{ fontSize: '0.82rem', color: '#4A7C3F', letterSpacing: '0.04em' }}>{title}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {badge && <span style={{ fontSize: '0.72rem', background: 'rgba(74,124,63,0.12)', color: '#2D5A27', padding: '0.15rem 0.6rem', borderRadius: '999px' }}>{badge}</span>}
          <span style={{ fontSize: '0.8rem', color: '#8B6914', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
        </span>
      </button>
      {open && <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.5)' }}>{children}</div>}
    </div>
  )
}

export default function CreateLessonForm({
  modules,
  existingLessons = [],
}: {
  modules: Module[]
  existingLessons?: Lesson[]
}) {
  const router = useRouter()

  const [moduleId, setModuleId]     = useState(modules[0]?.id || '')
  const [title, setTitle]           = useState('')
  const [lessonType, setLessonType] = useState<'mixed' | 'text'>('mixed')
  const [content, setContent]       = useState('')
  const [coverFile, setCoverFile]   = useState<File | null>(null)
  const [pdfFiles, setPdfFiles]     = useState<File[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])

  const [gdriveLink, setGdriveLink]   = useState('')
  const [gdriveTitle, setGdriveTitle] = useState('')
  const [gdriveLinkError, setGdriveLinkError] = useState('')

  const [muxData, setMuxData] = useState<{ playbackId: string; assetId: string; title: string } | null>(null)
  const [muxBusy, setMuxBusy] = useState(false)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  const nextPosition = useMemo(() => {
    const lessonsOfModule = existingLessons.filter((l) => l.module_id === moduleId)
    if (lessonsOfModule.length === 0) return 1
    return Math.max(...lessonsOfModule.map((l) => Number(l.position) || 0)) + 1
  }, [existingLessons, moduleId])

  function handleGdriveLinkChange(value: string) {
    setGdriveLink(value)
    if (value.trim()) {
      setGdriveLinkError(extractGDriveFileId(value) ? '' : 'El enlace no parece ser un link válido de Google Drive.')
    } else {
      setGdriveLinkError('')
    }
  }

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
    setError('')
    setSuccess(false)

    if (gdriveLink.trim() && !extractGDriveFileId(gdriveLink)) {
      setGdriveLinkError('El enlace no parece ser válido de Google Drive.')
      return
    }
    if (muxBusy) { setError('Esperá a que Mux termine de procesar el video antes de guardar.'); return }

    setLoading(true)
    let createdLessonId: string | null = null

    try {
      const authHeaders = await getAuthHeaders()

      // 1. Crear lección base
      const createRes = await fetch('/api/admin/lessons/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ moduleId, title, lessonType, content }),
      })
      const createData = await parseJsonSafely(createRes)
      if (!createRes.ok) throw new Error(createData.error || 'Error al crear lección')

      createdLessonId = createData.lessonId as string
      const lessonId = createdLessonId

      // 2. Portada
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

      // 3. Actualizar portada
      const updateRes = await fetch('/api/admin/lessons/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ lessonId, moduleId, title, lessonType, content, coverImageUrl, coverStorageBucket, coverStoragePath }),
      })
      const updateData = await parseJsonSafely(updateRes)
      if (!updateRes.ok) throw new Error(updateData.error || 'Error al actualizar portada')

      // 4. Assets
      const allAssets: any[] = []
      let pos = 1

      const uploadedPdfs = await uploadFiles(pdfFiles, 'pdf', lessonId)
      uploadedPdfs.forEach((file) => allAssets.push({ assetType: 'pdf', title: file.originalName, fileUrl: file.publicUrl, storageBucket: file.storageBucket, storagePath: file.storagePath, provider: 'local', position: pos++, originalName: file.originalName }))

      if (gdriveLink.trim()) {
        const fileId = extractGDriveFileId(gdriveLink)
        if (fileId) allAssets.push({ assetType: 'pdf', title: gdriveTitle.trim() || 'PDF (Google Drive)', fileUrl: null, provider: 'gdrive', providerFileId: fileId, position: pos++ })
      }

      if (muxData) {
        allAssets.push({ assetType: 'video', title: muxData.title || 'Video', fileUrl: muxData.playbackId, provider: 'mux', providerFileId: muxData.assetId, position: pos++ })
      }

      const uploadedImages = await uploadFiles(imageFiles, 'image', lessonId)
      uploadedImages.forEach((file) => allAssets.push({ assetType: 'image', title: file.originalName, fileUrl: file.publicUrl, storageBucket: file.storageBucket, storagePath: file.storagePath, provider: 'local', position: pos++, originalName: file.originalName }))

      if (allAssets.length > 0) {
        const assetsRes = await fetch('/api/admin/lesson-assets/create-many', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({ lessonId, assets: allAssets }),
        })
        const assetsData = await parseJsonSafely(assetsRes)
        if (!assetsRes.ok) throw new Error(assetsData.error || 'Error al guardar archivos')
      }

      // 5. Reset
      setTitle('')
      setContent('')
      setLessonType('mixed')
      setCoverFile(null)
      setPdfFiles([])
      setImageFiles([])
      setGdriveLink('')
      setGdriveTitle('')
      setGdriveLinkError('')
      setMuxData(null)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      router.refresh()
    } catch (err) {
      if (createdLessonId) {
        try {
          const authHeaders = await getAuthHeaders()
          await fetch('/api/admin/lessons/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify({ lessonId: createdLessonId }),
          })
        } catch {}
      }
      setError(err instanceof Error ? err.message : 'Error al crear lección')
    } finally {
      setLoading(false)
    }
  }

  const isBlocked = loading || !!gdriveLinkError || muxBusy

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontFamily: 'Georgia, serif' }}>

      {/* ── Información básica (siempre visible) ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Módulo</label>
          <select value={moduleId} onChange={(e) => setModuleId(e.target.value)} style={inputStyle} required>
            {modules.map((module) => {
              const course = Array.isArray(module.courses) ? module.courses[0] : module.courses
              return (
                <option key={module.id} value={module.id}>
                  {course?.title ? `${course.title} / ${module.title}` : module.title}
                </option>
              )
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
        <div style={{ background: 'rgba(74,124,63,0.06)', border: '1px solid rgba(74,124,63,0.15)', borderRadius: '0.75rem', padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#4A7C3F' }}>
          Posición asignada automáticamente: <strong>{nextPosition}</strong>
        </div>
      </div>

      {/* ── Descripción ── */}
      <Section title="Contenido / descripción (opcional)" badge={content ? '✓' : undefined}>
        <textarea placeholder="Descripción de la lección..." value={content} onChange={(e) => setContent(e.target.value)} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} />
      </Section>

      {/* ── Portada ── */}
      <Section title="Imagen de portada" badge={coverFile ? '1 imagen' : undefined}>
        {coverFile && <img src={URL.createObjectURL(coverFile)} alt="Preview" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '0.75rem', marginBottom: '0.75rem', border: '1px solid rgba(74,124,63,0.15)' }} />}
        <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          style={{ width: '100%', padding: '0.6rem', borderRadius: '0.75rem', border: '1px solid rgba(74,124,63,0.2)', background: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', color: '#2C2C2C', boxSizing: 'border-box' }} />
      </Section>

      {/* ── Video Mux ── */}
      <Section title="▶ Video con Mux (streaming)" badge={muxData ? '✅ listo' : muxBusy ? '⚙ procesando…' : undefined} defaultOpen>
        <MuxUploadSection
          onReady={(data) => { setMuxData(data); setMuxBusy(false) }}
          onReset={() => { setMuxData(null); setMuxBusy(false) }}
          onBusyChange={setMuxBusy}
        />
      </Section>

      {/* ── PDFs ── */}
      <Section title="☁ PDFs" badge={(pdfFiles.length > 0 || (gdriveLink && !gdriveLinkError)) ? `${pdfFiles.length + (gdriveLink && !gdriveLinkError ? 1 : 0)} archivo(s)` : undefined}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={labelStyle}>PDFs locales</label>
            <input type="file" accept=".pdf,application/pdf" multiple onChange={(e) => setPdfFiles(Array.from(e.target.files || []))}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '0.75rem', border: '1px solid rgba(74,124,63,0.2)', background: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', color: '#2C2C2C', boxSizing: 'border-box' }} />
            {pdfFiles.length > 0 && <p style={{ fontSize: '0.75rem', color: '#4A7C3F', marginTop: '0.4rem' }}>{pdfFiles.length} archivo(s) seleccionado(s)</p>}
          </div>
          <div style={{ borderTop: '1px solid rgba(74,124,63,0.15)', paddingTop: '0.75rem' }}>
            <p style={{ fontSize: '0.78rem', color: '#5C5C4A', marginBottom: '0.75rem', lineHeight: '1.5' }}>
              Pegá el enlace compartido del PDF en Google Drive. El archivo debe estar configurado como{' '}
              <strong>"Cualquiera con el enlace puede ver"</strong>.
            </p>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ ...labelStyle, color: '#1A56A4' }}>Título del PDF <span style={{ color: '#8B6914', fontSize: '0.7rem' }}>(opcional)</span></label>
              <input type="text" value={gdriveTitle} onChange={(e) => setGdriveTitle(e.target.value)} placeholder="ej: Material de lectura - Módulo 1" style={{ ...inputStyle, border: '1.5px solid rgba(26,86,164,0.25)' }} />
            </div>
            <div>
              <label style={{ ...labelStyle, color: '#1A56A4' }}>Enlace de Google Drive</label>
              <input type="url" value={gdriveLink} onChange={(e) => handleGdriveLinkChange(e.target.value)} placeholder="https://drive.google.com/file/d/ABC123.../view?usp=sharing"
                style={{ ...inputStyle, border: `1.5px solid ${gdriveLinkError ? 'rgba(180,60,40,0.5)' : gdriveLink && !gdriveLinkError ? 'rgba(74,124,63,0.5)' : 'rgba(26,86,164,0.25)'}` }} />
              {gdriveLinkError && <p style={{ fontSize: '0.78rem', color: '#8B2500', marginTop: '0.4rem', lineHeight: '1.4' }}>⚠ {gdriveLinkError}</p>}
              {gdriveLink && !gdriveLinkError && extractGDriveFileId(gdriveLink) && (
                <p style={{ fontSize: '0.78rem', color: '#2D5A27', marginTop: '0.4rem' }}>
                  ✓ Link válido · File ID:{' '}
                  <code style={{ background: 'rgba(74,124,63,0.08)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>{extractGDriveFileId(gdriveLink)}</code>
                </p>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Imágenes ── */}
      <Section title="🖼 Imágenes internas" badge={imageFiles.length > 0 ? `${imageFiles.length} imagen(es)` : undefined}>
        <input type="file" accept="image/*" multiple onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
          style={{ width: '100%', padding: '0.6rem', borderRadius: '0.75rem', border: '1px solid rgba(74,124,63,0.2)', background: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', color: '#2C2C2C', boxSizing: 'border-box' }} />
        {imageFiles.length > 0 && <p style={{ fontSize: '0.75rem', color: '#4A7C3F', marginTop: '0.4rem' }}>{imageFiles.length} imagen(es) seleccionada(s)</p>}
      </Section>

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

      <button type="submit" disabled={isBlocked}
        style={{ padding: '0.875rem', borderRadius: '999px', background: loading ? '#7aaa6f' : '#4A7C3F', color: '#F5F2E8', fontSize: '1rem', fontFamily: 'Georgia, serif', border: 'none', cursor: isBlocked ? 'not-allowed' : 'pointer', letterSpacing: '0.03em', boxShadow: '0 4px 16px rgba(74,124,63,0.2)', opacity: isBlocked ? 0.7 : 1 }}>
        {loading ? 'Creando lección...' : muxBusy ? 'Esperá — Mux procesando…' : 'Crear lección'}
      </button>
    </form>
  )
}