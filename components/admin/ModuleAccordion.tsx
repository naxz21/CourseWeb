'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import DeleteModuleButton from '@/components/admin/DeleteModuleButton'
import MoveModuleButtons from '@/components/admin/MoveModuleButtons'
import DeleteLessonButton from '@/components/admin/DeleteLessonButton'
import MuxUploadSection from '@/components/admin/MuxUploadSection'
import { extractGDriveFileId } from '@/lib/gdrive'

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

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.65rem 1rem', borderRadius: '0.75rem',
  border: '1.5px solid rgba(74,124,63,0.3)', background: 'rgba(255,255,255,0.8)',
  color: '#2C2C2C', fontSize: '0.875rem', fontFamily: 'Georgia, serif',
  outline: 'none', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem', color: '#4A7C3F', letterSpacing: '0.05em',
  display: 'block', marginBottom: '0.35rem',
}

// ─── Sección colapsable reutilizable ─────────────────────────────────────────
function Section({ title, badge, children, defaultOpen = false }: {
  title: string; badge?: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ border: '1px solid rgba(74,124,63,0.18)', borderRadius: '0.75rem', overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{ width: '100%', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(245,242,232,0.7)', border: 'none', cursor: 'pointer', fontFamily: 'Georgia, serif' }}
      >
        <span style={{ fontSize: '0.78rem', color: '#4A7C3F', letterSpacing: '0.05em' }}>{title}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {badge && <span style={{ fontSize: '0.7rem', background: 'rgba(74,124,63,0.12)', color: '#2D5A27', padding: '0.1rem 0.5rem', borderRadius: '999px' }}>{badge}</span>}
          <span style={{ fontSize: '0.75rem', color: '#8B6914', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
        </span>
      </button>
      {open && (
        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.5)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Formulario de nueva lección (dentro del acordeón de módulo) ──────────────
function AddLessonForm({ module, onDone }: { module: Module; onDone: () => void }) {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [lessonType, setLessonType] = useState<'mixed' | 'text'>('mixed')
  const [content, setContent] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [pdfFiles, setPdfFiles] = useState<File[]>([])
  const [gdriveLink, setGdriveLink] = useState('')
  const [gdriveTitle, setGdriveTitle] = useState('')
  const [gdriveLinkError, setGdriveLinkError] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [muxData, setMuxData] = useState<{ playbackId: string; assetId: string; title: string } | null>(null)
  const [muxBusy, setMuxBusy] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)
  const [createError, setCreateError] = useState('')

  function handleGdriveLinkChange(value: string) {
    setGdriveLink(value)
    if (value.trim()) {
      const fileId = extractGDriveFileId(value)
      setGdriveLinkError(fileId ? '' : 'Enlace de Google Drive inválido.')
    } else {
      setGdriveLinkError('')
    }
  }

  async function uploadFiles(files: File[], assetType: string, lessonId: string) {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    if (gdriveLinkError) return
    if (muxBusy) { setCreateError('Esperá a que Mux termine de procesar el video.'); return }

    setCreating(true)
    setCreateError('')
    setCreateSuccess(false)

    try {
      const authHeaders = await getAuthHeaders()

      // 1. Crear lección
      const createRes = await fetch('/api/admin/lessons/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ moduleId: module.id, title: title.trim(), lessonType, content }),
      })
      const createData = await parseJsonSafely(createRes)
      if (!createRes.ok) throw new Error(createData.error || 'Error al crear lección')
      const lessonId = createData.lessonId as string

      // 2. Portada
      let coverImageUrl: string | null = null
      let coverStorageBucket: string | null = null
      let coverStoragePath: string | null = null
      if (coverFile) {
        const uploaded = await uploadFiles([coverFile], 'cover', lessonId)
        if (uploaded[0]) {
          coverImageUrl = uploaded[0].publicUrl
          coverStorageBucket = uploaded[0].storageBucket
          coverStoragePath = uploaded[0].storagePath
        }
      }

      await fetch('/api/admin/lessons/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ lessonId, moduleId: module.id, title: title.trim(), lessonType, content, coverImageUrl, coverStorageBucket, coverStoragePath }),
      })

      // 3. Assets
      const allAssets: any[] = []
      let pos = 1

      const uploadedPdfs = await uploadFiles(pdfFiles, 'pdf', lessonId)
      uploadedPdfs.forEach((f) => allAssets.push({ assetType: 'pdf', title: f.originalName, fileUrl: f.publicUrl, storageBucket: f.storageBucket, storagePath: f.storagePath, provider: 'local', position: pos++, originalName: f.originalName }))

      if (gdriveLink.trim()) {
        const fileId = extractGDriveFileId(gdriveLink)
        if (fileId) allAssets.push({ assetType: 'pdf', title: gdriveTitle.trim() || 'PDF (Google Drive)', fileUrl: null, provider: 'gdrive', providerFileId: fileId, position: pos++ })
      }

      if (muxData) {
        allAssets.push({ assetType: 'video', title: muxData.title || 'Video', fileUrl: muxData.playbackId, provider: 'mux', providerFileId: muxData.assetId, position: pos++ })
      }

      const uploadedImages = await uploadFiles(imageFiles, 'image', lessonId)
      uploadedImages.forEach((f) => allAssets.push({ assetType: 'image', title: f.originalName, fileUrl: f.publicUrl, storageBucket: f.storageBucket, storagePath: f.storagePath, provider: 'local', position: pos++, originalName: f.originalName }))

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
      setTimeout(() => { onDone(); router.refresh() }, 1800)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error al crear lección')
    } finally {
      setCreating(false)
    }
  }

  const isBlocked = creating || createSuccess || !!gdriveLinkError || muxBusy

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ fontSize: '0.8rem', color: '#4A7C3F', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        Nueva lección — {module.title}
      </p>

      {/* Título y tipo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem' }}>
        <div>
          <label style={labelStyle}>Título</label>
          <input type="text" placeholder="Ej: Introducción al kéfir" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} required autoFocus />
        </div>
        <div>
          <label style={labelStyle}>Tipo</label>
          <select value={lessonType} onChange={(e) => setLessonType(e.target.value as 'mixed' | 'text')} style={{ ...inputStyle, width: 'auto' }}>
            <option value="mixed">Multimedia</option>
            <option value="text">Solo texto</option>
          </select>
        </div>
      </div>

      {/* Descripción colapsable */}
      <Section title="Descripción (opcional)">
        <textarea placeholder="Descripción de la lección..." value={content} onChange={(e) => setContent(e.target.value)} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
      </Section>

      {/* Portada colapsable */}
      <Section title="Imagen de portada" badge={coverFile ? '1 imagen' : undefined}>
        {coverFile && <img src={URL.createObjectURL(coverFile)} alt="preview" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '0.5rem' }} />}
        <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} style={{ width: '100%', fontSize: '0.8rem', color: '#2C2C2C' }} />
      </Section>

      {/* Video Mux colapsable */}
      <Section title="▶ Video con Mux (streaming)" badge={muxData ? '✅ listo' : muxBusy ? '⚙ procesando…' : undefined} defaultOpen>
        <MuxUploadSection
          onReady={(data) => { setMuxData(data); setMuxBusy(false) }}
          onReset={() => { setMuxData(null); setMuxBusy(false) }}
          onBusyChange={setMuxBusy}
        />
      </Section>

      {/* PDFs colapsable */}
      <Section title="☁ PDFs" badge={pdfFiles.length > 0 || gdriveLink ? `${pdfFiles.length + (gdriveLink && !gdriveLinkError ? 1 : 0)} archivo(s)` : undefined}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={labelStyle}>PDFs locales</label>
            <input type="file" accept=".pdf,application/pdf" multiple onChange={(e) => setPdfFiles(Array.from(e.target.files || []))} style={{ width: '100%', fontSize: '0.8rem', color: '#2C2C2C' }} />
            {pdfFiles.length > 0 && <p style={{ fontSize: '0.75rem', color: '#4A7C3F', marginTop: '0.3rem' }}>{pdfFiles.length} archivo(s)</p>}
          </div>
          <div style={{ borderTop: '1px solid rgba(74,124,63,0.15)', paddingTop: '0.75rem' }}>
            <label style={{ ...labelStyle, color: '#1A56A4' }}>Título del PDF de Drive (opcional)</label>
            <input type="text" value={gdriveTitle} onChange={(e) => setGdriveTitle(e.target.value)} placeholder="ej: Material de lectura" style={{ ...inputStyle, marginBottom: '0.5rem' }} />
            <label style={{ ...labelStyle, color: '#1A56A4' }}>Enlace de Google Drive</label>
            <input
              type="url" value={gdriveLink} onChange={(e) => handleGdriveLinkChange(e.target.value)}
              placeholder="https://drive.google.com/file/d/..."
              style={{ ...inputStyle, border: `1.5px solid ${gdriveLinkError ? 'rgba(180,60,40,0.5)' : gdriveLink && !gdriveLinkError ? 'rgba(74,124,63,0.5)' : 'rgba(26,86,164,0.25)'}` }}
            />
            {gdriveLinkError && <p style={{ fontSize: '0.75rem', color: '#8B2500', marginTop: '0.3rem' }}>⚠ {gdriveLinkError}</p>}
            {gdriveLink && !gdriveLinkError && extractGDriveFileId(gdriveLink) && <p style={{ fontSize: '0.75rem', color: '#2D5A27', marginTop: '0.3rem' }}>✓ Link válido</p>}
          </div>
        </div>
      </Section>

      {/* Imágenes colapsable */}
      <Section title="🖼 Imágenes" badge={imageFiles.length > 0 ? `${imageFiles.length} imagen(es)` : undefined}>
        <input type="file" accept="image/*" multiple onChange={(e) => setImageFiles(Array.from(e.target.files || []))} style={{ width: '100%', fontSize: '0.8rem', color: '#2C2C2C' }} />
        {imageFiles.length > 0 && <p style={{ fontSize: '0.75rem', color: '#4A7C3F', marginTop: '0.3rem' }}>{imageFiles.length} imagen(es)</p>}
      </Section>

      {createError && <p style={{ fontSize: '0.8rem', color: '#8B2500', background: 'rgba(180,60,40,0.08)', border: '1px solid rgba(180,60,40,0.2)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', margin: 0 }}>{createError}</p>}
      {createSuccess && <p style={{ fontSize: '0.8rem', color: '#2D5A27', background: 'rgba(74,124,63,0.1)', border: '1px solid rgba(74,124,63,0.3)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', margin: 0 }}>✓ Lección creada correctamente</p>}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="submit" disabled={isBlocked}
          style={{ padding: '0.65rem 1.5rem', borderRadius: '999px', background: '#4A7C3F', color: '#F5F2E8', fontSize: '0.875rem', border: 'none', cursor: isBlocked ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', opacity: isBlocked ? 0.7 : 1, boxShadow: '0 4px 12px rgba(74,124,63,0.2)' }}>
          {createSuccess ? '✓ Creada' : creating ? 'Creando...' : muxBusy ? 'Esperá — Mux procesando…' : 'Crear lección'}
        </button>
        <button type="button" onClick={onDone}
          style={{ padding: '0.65rem 1.25rem', borderRadius: '999px', border: '1.5px solid rgba(74,124,63,0.3)', color: '#5C5C4A', background: 'transparent', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ModuleAccordion({ module, lessons }: { module: Module; lessons: Lesson[] }) {
  const [open, setOpen] = useState(false)
  const [showAddLesson, setShowAddLesson] = useState(false)

  return (
    <div style={{ background: 'rgba(245,242,232,0.8)', border: '1px solid rgba(74,124,63,0.15)', borderRadius: '1rem', overflow: 'hidden' }}>

      {/* Cabecera del módulo */}
      <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setOpen(!open)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', flex: 1, padding: 0 }}>
          <span style={{ fontSize: '0.75rem', color: '#8B6914', minWidth: '24px', fontFamily: 'Georgia, serif' }}>{module.position}.</span>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '400', color: '#2D5A27', margin: 0 }}>{module.title}</h4>
            {module.description && <p style={{ fontSize: '0.8rem', color: '#5C5C4A', margin: '0.1rem 0 0' }}>{module.description}</p>}
          </div>
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#8B6914', background: 'rgba(139,105,20,0.1)', padding: '0.2rem 0.6rem', borderRadius: '999px', whiteSpace: 'nowrap' }}>
            {lessons.length} {lessons.length === 1 ? 'lección' : 'lecciones'}
          </span>
          <span style={{ fontSize: '1rem', color: '#4A7C3F', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
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
            <p style={{ fontSize: '0.875rem', color: '#5C5C4A', fontStyle: 'italic', textAlign: 'center', padding: '0.75rem' }}>
              Este módulo no tiene lecciones todavía.
            </p>
          ) : (
            lessons.map((lesson) => (
              <div key={lesson.id} style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(74,124,63,0.15)', borderRadius: '0.75rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                  {lesson.cover_image_url && (
                    <img src={lesson.cover_image_url} alt={lesson.title} style={{ width: '48px', height: '48px', borderRadius: '0.5rem', objectFit: 'cover', flexShrink: 0 }} />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.9rem', color: '#2D5A27', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lesson.position}. {lesson.title}
                    </p>
                    <span style={{ fontSize: '0.7rem', color: '#8B6914', background: 'rgba(139,105,20,0.1)', padding: '0.1rem 0.5rem', borderRadius: '999px' }}>
                      {lesson.lesson_type}
                    </span>
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
            <button type="button" onClick={() => setShowAddLesson(true)}
              style={{ padding: '0.6rem 1.25rem', borderRadius: '999px', border: '1.5px dashed rgba(74,124,63,0.4)', color: '#4A7C3F', background: 'transparent', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Georgia, serif', alignSelf: 'flex-start' }}>
              + Agregar lección
            </button>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '1rem', padding: '1.25rem' }}>
              <AddLessonForm module={module} onDone={() => setShowAddLesson(false)} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
