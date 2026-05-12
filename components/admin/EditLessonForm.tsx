'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DeleteLessonAssetButton from '@/components/admin/DeleteLessonAssetButton'
import { extractGDriveFileId } from '@/lib/gdrive'
import MuxUploadSection from '@/components/admin/MuxUploadSection'

type Module = {
  id: string
  title: string
  courses?: { title: string } | { title: string }[]
}

type Asset = {
  id: string
  asset_type: 'video' | 'pdf' | 'image'
  title: string | null
  file_url: string | null
  position: number
  provider?: string
  provider_file_id?: string | null
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
  try { return JSON.parse(text) } catch { throw new Error(text || 'Respuesta inválida del servidor') }
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

// ─── Icono por tipo de asset ──────────────────────────────────────────────────
function assetIcon(asset: Asset) {
  if (asset.provider === 'mux') return '▶'
  if (asset.provider === 'gdrive') return '☁'
  if (asset.asset_type === 'pdf') return '📄'
  if (asset.asset_type === 'image') return '🖼'
  return '📎'
}

// ─── Preview de asset existente ───────────────────────────────────────────────
function AssetPreview({ asset }: { asset: Asset }) {
  if (asset.provider === 'mux' && asset.file_url) {
    return (
      <img
        src={`https://image.mux.com/${asset.file_url}/thumbnail.jpg?width=120&height=68&fit_mode=smartcrop`}
        alt={asset.title || 'Video'}
        style={{ width: '80px', height: '48px', objectFit: 'cover', borderRadius: '0.4rem', flexShrink: 0, border: '1px solid rgba(74,124,63,0.2)' }}
      />
    )
  }
  if (asset.asset_type === 'image' && asset.file_url) {
    return (
      <img
        src={asset.file_url}
        alt={asset.title || 'Imagen'}
        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '0.4rem', flexShrink: 0, border: '1px solid rgba(74,124,63,0.2)' }}
      />
    )
  }
  return null
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function EditLessonForm({ lesson, modules }: { lesson: Lesson; modules: Module[] }) {
  const router = useRouter()

  const [moduleId, setModuleId] = useState(lesson.module_id)
  const [title, setTitle] = useState(lesson.title)
  const [lessonType, setLessonType] = useState<'mixed' | 'text'>(lesson.lesson_type === 'text' ? 'text' : 'mixed')
  const [content, setContent] = useState(lesson.content || '')
  const [coverFile, setCoverFile] = useState<File | null>(null)

  const [pdfFiles, setPdfFiles] = useState<File[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])

  const [gdriveLink, setGdriveLink] = useState('')
  const [gdriveTitle, setGdriveTitle] = useState('')
  const [gdriveLinkError, setGdriveLinkError] = useState('')

  const [muxData, setMuxData] = useState<{ playbackId: string; assetId: string; title: string } | null>(null)
  const [muxBusy, setMuxBusy] = useState(false)

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const existingAssets = Array.isArray(lesson.lesson_assets)
    ? [...lesson.lesson_assets].sort((a, b) => a.position - b.position)
    : []

  function handleGdriveLinkChange(value: string) {
    setGdriveLink(value)
    if (value.trim()) {
      setGdriveLinkError(extractGDriveFileId(value) ? '' : 'Enlace de Google Drive inválido.')
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
    setError('')
    setSuccess(false)
    if (gdriveLinkError) return
    if (muxBusy) { setError('Esperá a que Mux termine de procesar el video.'); return }

    setLoading(true)
    try {
      const authHeaders = await getAuthHeaders()

      // Portada
      let coverImageUrl = lesson.cover_image_url || null
      let coverStorageBucket = lesson.cover_storage_bucket || null
      let coverStoragePath = lesson.cover_storage_path || null
      if (coverFile) {
        const data = await uploadFiles([coverFile], 'cover', lesson.id)
        if (data[0]) { coverImageUrl = data[0].publicUrl; coverStorageBucket = data[0].storageBucket; coverStoragePath = data[0].storagePath }
      }

      const updateRes = await fetch('/api/admin/lessons/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ lessonId: lesson.id, moduleId, title, lessonType, content, coverImageUrl, coverStorageBucket, coverStoragePath }),
      })
      const updateData = await parseJsonSafely(updateRes)
      if (!updateRes.ok) throw new Error(updateData.error || 'Error al actualizar lección')

      const newAssets: any[] = []
      let pos = existingAssets.length + 1

      const uploadedPdfs = await uploadFiles(pdfFiles, 'pdf', lesson.id)
      uploadedPdfs.forEach((f) => newAssets.push({ assetType: 'pdf', title: f.originalName, fileUrl: f.publicUrl, storageBucket: f.storageBucket, storagePath: f.storagePath, provider: 'local', position: pos++ }))

      if (gdriveLink.trim()) {
        const fileId = extractGDriveFileId(gdriveLink)
        if (fileId) newAssets.push({ assetType: 'pdf', title: gdriveTitle.trim() || 'PDF (Google Drive)', fileUrl: null, provider: 'gdrive', providerFileId: fileId, position: pos++ })
      }

      if (muxData) {
        newAssets.push({ assetType: 'video', title: muxData.title || 'Video', fileUrl: muxData.playbackId, provider: 'mux', providerFileId: muxData.assetId, position: pos++ })
      }

      const uploadedImages = await uploadFiles(imageFiles, 'image', lesson.id)
      uploadedImages.forEach((f) => newAssets.push({ assetType: 'image', title: f.originalName, fileUrl: f.publicUrl, storageBucket: f.storageBucket, storagePath: f.storagePath, provider: 'local', position: pos++ }))

      if (newAssets.length > 0) {
        const assetsRes = await fetch('/api/admin/lesson-assets/create-many', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({ lessonId: lesson.id, assets: newAssets }),
        })
        const assetsData = await parseJsonSafely(assetsRes)
        if (!assetsRes.ok) throw new Error(assetsData.error || 'Error al guardar archivos')
      }

      setSuccess(true)
      setTimeout(() => { router.push('/admin/lecciones'); router.refresh() }, 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar lección')
    } finally {
      setLoading(false)
    }
  }

  const isBlocked = loading || success || !!gdriveLinkError || muxBusy

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontFamily: 'Georgia, serif' }}>

      {/* ── Información básica (siempre visible) ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Módulo</label>
          <select value={moduleId} onChange={(e) => setModuleId(e.target.value)} style={inputStyle} required>
            {modules.map((m) => {
              const course = Array.isArray(m.courses) ? m.courses[0] : m.courses
              return <option key={m.id} value={m.id}>{course?.title ? `${course.title} / ${m.title}` : m.title}</option>
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
            <option value="mixed">Multimedia (video, PDF, imágenes)</option>
            <option value="text">Solo texto</option>
          </select>
        </div>
      </div>

      {/* ── Descripción ── */}
      <Section title="Contenido / descripción" badge={content ? '✓' : undefined}>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} />
      </Section>

      {/* ── Portada ── */}
      <Section title="Portada" badge={lesson.cover_image_url || coverFile ? '✓ imagen' : undefined}>
        {(lesson.cover_image_url && !coverFile) && (
          <img src={lesson.cover_image_url} alt={lesson.title} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '0.75rem', marginBottom: '0.75rem', border: '1px solid rgba(74,124,63,0.15)' }} />
        )}
        {coverFile && (
          <img src={URL.createObjectURL(coverFile)} alt="Preview" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '0.75rem', marginBottom: '0.75rem', border: '1px solid rgba(74,124,63,0.15)' }} />
        )}
        <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          style={{ width: '100%', padding: '0.6rem', borderRadius: '0.75rem', border: '1px solid rgba(74,124,63,0.2)', background: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', color: '#2C2C2C', boxSizing: 'border-box' }} />
      </Section>

      {/* ── Assets actuales ── */}
      <Section title="Archivos actuales" badge={existingAssets.length > 0 ? `${existingAssets.length} archivo(s)` : undefined} defaultOpen>
        {existingAssets.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {existingAssets.map((asset) => (
              <div key={asset.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: 'rgba(245,242,232,0.8)', border: '1px solid rgba(74,124,63,0.15)', borderRadius: '0.75rem', padding: '0.65rem 0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                  <AssetPreview asset={asset} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0 }}>
                    <p style={{ fontSize: '0.875rem', color: '#2D5A27', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {assetIcon(asset)} {asset.title || 'Archivo'}
                    </p>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.68rem', color: '#8B6914', background: 'rgba(139,105,20,0.1)', padding: '0.1rem 0.45rem', borderRadius: '999px' }}>{asset.asset_type}</span>
                      {asset.provider === 'gdrive' && <span style={{ fontSize: '0.68rem', color: '#1A56A4', background: 'rgba(26,86,164,0.1)', padding: '0.1rem 0.45rem', borderRadius: '999px' }}>Google Drive</span>}
                      {asset.provider === 'mux' && <span style={{ fontSize: '0.68rem', color: '#2D5A27', background: 'rgba(74,124,63,0.1)', padding: '0.1rem 0.45rem', borderRadius: '999px' }}>Mux Stream</span>}
                    </div>
                  </div>
                </div>
                <DeleteLessonAssetButton assetId={asset.id} />
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.875rem', color: '#5C5C4A', fontStyle: 'italic' }}>No hay archivos cargados todavía.</p>
        )}
      </Section>

      {/* ── Video Mux ── */}
      <Section title="▶ Agregar video con Mux (streaming)" badge={muxData ? '✅ listo' : muxBusy ? '⚙ procesando…' : undefined} defaultOpen>
        <MuxUploadSection
          onReady={(data) => { setMuxData(data); setMuxBusy(false) }}
          onReset={() => { setMuxData(null); setMuxBusy(false) }}
          onBusyChange={setMuxBusy}
        />
      </Section>

      {/* ── PDFs ── */}
      <Section title="☁ Agregar PDFs" badge={(pdfFiles.length > 0 || (gdriveLink && !gdriveLinkError)) ? `${pdfFiles.length + (gdriveLink && !gdriveLinkError ? 1 : 0)} archivo(s)` : undefined}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={labelStyle}>PDFs locales</label>
            <input type="file" accept=".pdf,application/pdf" multiple onChange={(e) => setPdfFiles(Array.from(e.target.files || []))}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '0.75rem', border: '1px solid rgba(74,124,63,0.2)', background: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', color: '#2C2C2C', boxSizing: 'border-box' }} />
            {pdfFiles.length > 0 && <p style={{ fontSize: '0.75rem', color: '#4A7C3F', marginTop: '0.4rem' }}>{pdfFiles.length} archivo(s) seleccionado(s)</p>}
          </div>
          <div style={{ borderTop: '1px solid rgba(74,124,63,0.15)', paddingTop: '0.75rem' }}>
            <p style={{ fontSize: '0.78rem', color: '#5C5C4A', marginBottom: '0.75rem', lineHeight: '1.5' }}>
              El archivo de Drive debe estar configurado como <strong>"Cualquiera con el enlace puede ver"</strong>.
            </p>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ ...labelStyle, color: '#1A56A4' }}>Título (opcional)</label>
              <input type="text" value={gdriveTitle} onChange={(e) => setGdriveTitle(e.target.value)} placeholder="ej: Material de lectura" style={{ ...inputStyle, border: '1.5px solid rgba(26,86,164,0.25)' }} />
            </div>
            <div>
              <label style={{ ...labelStyle, color: '#1A56A4' }}>Enlace de Google Drive</label>
              <input type="url" value={gdriveLink} onChange={(e) => handleGdriveLinkChange(e.target.value)} placeholder="https://drive.google.com/file/d/..."
                style={{ ...inputStyle, border: `1.5px solid ${gdriveLinkError ? 'rgba(180,60,40,0.5)' : gdriveLink && !gdriveLinkError ? 'rgba(74,124,63,0.5)' : 'rgba(26,86,164,0.25)'}` }} />
              {gdriveLinkError && <p style={{ fontSize: '0.78rem', color: '#8B2500', marginTop: '0.4rem' }}>⚠ {gdriveLinkError}</p>}
              {gdriveLink && !gdriveLinkError && extractGDriveFileId(gdriveLink) && (
                <p style={{ fontSize: '0.78rem', color: '#2D5A27', marginTop: '0.4rem' }}>
                  ✓ Link válido · ID: <code style={{ background: 'rgba(74,124,63,0.08)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>{extractGDriveFileId(gdriveLink)}</code>
                </p>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Imágenes ── */}
      <Section title="🖼 Agregar imágenes" badge={imageFiles.length > 0 ? `${imageFiles.length} imagen(es)` : undefined}>
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
          ✓ Guardado correctamente, redirigiendo...
        </div>
      )}

      <button type="submit" disabled={isBlocked}
        style={{ padding: '0.875rem', borderRadius: '999px', background: '#4A7C3F', color: '#F5F2E8', fontSize: '1rem', fontFamily: 'Georgia, serif', border: 'none', cursor: isBlocked ? 'not-allowed' : 'pointer', letterSpacing: '0.03em', boxShadow: '0 4px 16px rgba(74,124,63,0.2)', opacity: isBlocked ? 0.7 : 1 }}>
        {success ? '✓ Guardado' : loading ? 'Guardando...' : muxBusy ? 'Esperá — Mux procesando…' : 'Guardar cambios'}
      </button>
    </form>
  )
}
