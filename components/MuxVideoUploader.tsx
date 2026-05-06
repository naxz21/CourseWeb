'use client'
// components/MuxVideoUploader.tsx
// Componente para el panel admin: sube un video directo a Mux y guarda el resultado en Supabase

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  lessonId: string
  onSuccess?: (playbackId: string, assetId: string) => void
}

type Stage = 'idle' | 'uploading' | 'processing' | 'ready' | 'error'

export default function MuxVideoUploader({ lessonId, onSuccess }: Props) {
  const [stage, setStage]       = useState<Stage>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError]       = useState<string | null>(null)
  const [title, setTitle]       = useState('')
  const [playbackId, setPlaybackId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(file: File) {
    setStage('uploading')
    setError(null)
    setProgress(0)

    try {
      // 1. Pedir URL de upload a nuestra API
      const res = await fetch('/api/mux/upload', { method: 'POST' })
      if (!res.ok) throw new Error('No se pudo iniciar el upload')
      const { uploadId, uploadUrl } = await res.json()

      // 2. Subir el archivo directo a Mux con XHR para tener progreso
      await uploadToMux(file, uploadUrl, (pct) => setProgress(pct))

      // 3. Esperar a que Mux procese el video
      setStage('processing')
      const { assetId, playbackId: pid } = await pollUntilReady(uploadId)

      // 4. Guardar en Supabase (lesson_assets)
      const supabase = createClient()
      const { error: dbErr } = await supabase.from('lesson_assets').insert({
        lesson_id:        lessonId,
        asset_type:       'video',
        title:            title || file.name.replace(/\.[^.]+$/, ''),
        provider:         'mux',
        provider_file_id: assetId,
        file_url:         pid, // guardamos el playback_id en file_url para compatibilidad
        position:         0,
      })

      if (dbErr) throw new Error(dbErr.message)

      setPlaybackId(pid)
      setStage('ready')
      onSuccess?.(pid, assetId)
    } catch (err: any) {
      setError(err.message)
      setStage('error')
    }
  }

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.heading}>Subir video con Mux</h3>

      {stage === 'idle' || stage === 'error' ? (
        <>
          <input
            placeholder="Título del video (opcional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
          />

          <div
            style={styles.dropzone}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const file = e.dataTransfer.files[0]
              if (file) handleUpload(file)
            }}
          >
            <span style={{ fontSize: '2rem' }}>🎬</span>
            <p style={{ margin: '0.5rem 0 0', color: '#5C5C4A', fontSize: '0.9rem' }}>
              Arrastrá tu video acá o <strong style={{ color: '#4A7C3F' }}>hacé click</strong>
            </p>
            <p style={{ margin: '0.25rem 0 0', color: '#8B8B6A', fontSize: '0.75rem' }}>
              MP4, MOV, MKV, WebM — cualquier tamaño
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUpload(file)
              }}
            />
          </div>

          {error && (
            <p style={styles.errorMsg}>⚠ {error}</p>
          )}
        </>
      ) : null}

      {stage === 'uploading' && (
        <div style={styles.statusBox}>
          <p style={{ margin: '0 0 0.75rem', color: '#2D5A27', fontSize: '0.9rem' }}>
            Subiendo a Mux… {progress}%
          </p>
          <div style={styles.progressBg}>
            <div style={{ ...styles.progressBar, width: `${progress}%` }} />
          </div>
        </div>
      )}

      {stage === 'processing' && (
        <div style={styles.statusBox}>
          <p style={{ margin: 0, color: '#8B6914', fontSize: '0.9rem' }}>
            ⚙ Mux está procesando el video (suele tardar 1–3 min)…
          </p>
          <div style={{ marginTop: '0.75rem', ...styles.progressBg }}>
            <div style={{ ...styles.progressBar, width: '100%', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </div>
      )}

      {stage === 'ready' && playbackId && (
        <div style={styles.successBox}>
          <p style={{ margin: '0 0 0.5rem', color: '#2D5A27', fontWeight: 600 }}>
            ✅ Video listo
          </p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#5C5C4A' }}>
            Playback ID: <code>{playbackId}</code>
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uploadToMux(file: File, url: string, onProgress: (pct: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload  = () => (xhr.status < 300 ? resolve() : reject(new Error(`Upload HTTP ${xhr.status}`)))
    xhr.onerror = () => reject(new Error('Error de red al subir el video'))
    xhr.send(file)
  })
}

async function pollUntilReady(uploadId: string, maxWait = 300_000) {
  const start = Date.now()
  while (Date.now() - start < maxWait) {
    await sleep(4000)
    const res  = await fetch(`/api/mux/status/${uploadId}`)
    const data = await res.json()
    if (data.status === 'ready') return { assetId: data.assetId as string, playbackId: data.playbackId as string }
    if (data.status === 'error' || data.error) throw new Error('Mux reportó un error procesando el video')
  }
  throw new Error('Tiempo de espera agotado. Revisá el dashboard de Mux.')
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    background: 'rgba(255,255,255,0.6)',
    border: '1px solid rgba(74,124,63,0.2)',
    borderRadius: '1.25rem',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  heading: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: '#2D5A27',
    fontFamily: 'Georgia, serif',
  },
  input: {
    width: '100%',
    padding: '0.6rem 1rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(74,124,63,0.25)',
    background: 'rgba(245,242,232,0.8)',
    fontSize: '0.875rem',
    color: '#2D5A27',
    outline: 'none',
    boxSizing: 'border-box',
  },
  dropzone: {
    border: '2px dashed rgba(74,124,63,0.35)',
    borderRadius: '1rem',
    padding: '2rem',
    textAlign: 'center',
    cursor: 'pointer',
    background: 'rgba(74,124,63,0.03)',
    transition: 'background 0.2s',
  },
  progressBg: {
    height: '8px',
    background: 'rgba(74,124,63,0.15)',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    background: '#4A7C3F',
    borderRadius: '999px',
    transition: 'width 0.3s ease',
  },
  statusBox: {
    background: 'rgba(74,124,63,0.05)',
    border: '1px solid rgba(74,124,63,0.15)',
    borderRadius: '1rem',
    padding: '1.25rem',
  },
  successBox: {
    background: 'rgba(74,124,63,0.08)',
    border: '1px solid rgba(74,124,63,0.3)',
    borderRadius: '1rem',
    padding: '1.25rem',
  },
  errorMsg: {
    color: '#8B2500',
    background: 'rgba(180,60,40,0.06)',
    border: '1px solid rgba(180,60,40,0.15)',
    borderRadius: '0.75rem',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    margin: 0,
  },
}
