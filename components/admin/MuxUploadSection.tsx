'use client'

import { useRef, useState } from 'react'

type MuxStage = 'idle' | 'uploading' | 'processing' | 'ready' | 'error'

interface Props {
  onReady: (data: { playbackId: string; assetId: string; title: string }) => void
  onReset: () => void
  onBusyChange?: (busy: boolean) => void
}

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
    await new Promise((r) => setTimeout(r, 4000))
    const res  = await fetch(`/api/mux/status/${uploadId}`)
    const data = await res.json()
    if (data.status === 'ready') return { assetId: data.assetId as string, playbackId: data.playbackId as string }
    if (data.status === 'errored' || data.error) throw new Error('Mux reportó un error procesando el video')
  }
  throw new Error('Tiempo de espera agotado. Revisá el dashboard de Mux.')
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

export default function MuxUploadSection({ onReady, onReset, onBusyChange }: Props) {
  const [stage, setStage]       = useState<MuxStage>('idle')
  const [progress, setProgress] = useState(0)
  const [title, setTitle]       = useState('')
  const [error, setError]       = useState('')
  const [playbackId, setPlaybackId] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setStage('uploading')
    setError('')
    setProgress(0)
    onBusyChange?.(true)

    try {
      const res = await fetch('/api/mux/upload', { method: 'POST' })
      if (!res.ok) throw new Error('No se pudo iniciar el upload en Mux')
      const { uploadId, uploadUrl } = await res.json()

      await uploadToMux(file, uploadUrl, setProgress)

      setStage('processing')
      const result = await pollUntilReady(uploadId)

      setPlaybackId(result.playbackId)
      setStage('ready')
      onBusyChange?.(false)
      onReady({ ...result, title: title.trim() || file.name.replace(/\.[^.]+$/, '') })
    } catch (err: any) {
      setError(err.message)
      setStage('error')
      onBusyChange?.(false)
    }
  }

  function handleReset() {
    setStage('idle')
    setError('')
    setProgress(0)
    setPlaybackId('')
    setTitle('')
    onReset()
  }

  return (
    <div style={{ border: '1px solid rgba(74,124,63,0.35)', background: 'rgba(74,124,63,0.03)', borderRadius: '1rem', padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span>▶</span>
        <p style={{ ...labelStyle, marginBottom: 0, color: '#2D5A27', fontSize: '0.85rem' }}>
          Agregar video con Mux (streaming)
        </p>
      </div>

      <p style={{ fontSize: '0.78rem', color: '#5C5C4A', marginBottom: '0.75rem', lineHeight: '1.5' }}>
        El video se sube directo a Mux — soporta cualquier tamaño y se reproduce con streaming adaptativo.{' '}
        <strong style={{ color: '#2D5A27' }}>Esperá a que diga "Listo" antes de guardar.</strong>
      </p>

      {/* Título — solo en idle/error */}
      {(stage === 'idle' || stage === 'error') && (
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={labelStyle}>
            Título del video <span style={{ color: '#8B6914', fontSize: '0.7rem' }}>(opcional)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ej: Clase 1 - Introducción a la fermentación"
            style={inputStyle}
          />
        </div>
      )}

      {/* Dropzone */}
      {(stage === 'idle' || stage === 'error') && (
        <>
          <div
            style={{ border: '2px dashed rgba(74,124,63,0.4)', borderRadius: '0.75rem', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(74,124,63,0.02)' }}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          >
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#4A7C3F' }}>
              🎬 Arrastrá el video acá o <strong>hacé click</strong>
            </p>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: '#8B8B6A' }}>
              MP4, MOV, MKV, WebM — cualquier tamaño
            </p>
          </div>
          <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          {error && (
            <p style={{ fontSize: '0.8rem', color: '#8B2500', marginTop: '0.5rem' }}>⚠ {error}</p>
          )}
        </>
      )}

      {/* Subiendo */}
      {stage === 'uploading' && (
        <div style={{ background: 'rgba(74,124,63,0.05)', borderRadius: '0.75rem', padding: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#2D5A27', marginBottom: '0.5rem' }}>Subiendo… {progress}%</p>
          <div style={{ height: '8px', background: 'rgba(74,124,63,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#4A7C3F', borderRadius: '999px', width: `${progress}%`, transition: 'width 0.3s ease' }} />
          </div>
        </div>
      )}

      {/* Procesando */}
      {stage === 'processing' && (
        <div style={{ background: 'rgba(139,105,20,0.06)', border: '1px solid rgba(139,105,20,0.2)', borderRadius: '0.75rem', padding: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#8B6914', margin: '0 0 0.5rem' }}>
            ⚙ Mux está procesando el video — tarda 1 a 3 minutos…
          </p>
          <div style={{ height: '6px', background: 'rgba(139,105,20,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#8B6914', borderRadius: '999px', width: '100%', animation: 'muxpulse 1.5s ease-in-out infinite' }} />
          </div>
          <style>{`@keyframes muxpulse{0%,100%{opacity:1}50%{opacity:0.35}}`}</style>
        </div>
      )}

      {/* Listo */}
      {stage === 'ready' && (
        <div style={{ background: 'rgba(74,124,63,0.08)', border: '1px solid rgba(74,124,63,0.3)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#2D5A27', fontWeight: 600, margin: '0 0 0.25rem' }}>✅ Video listo para guardar</p>
            <p style={{ fontSize: '0.75rem', color: '#5C5C4A', margin: 0 }}>
              Playback ID: <code style={{ background: 'rgba(74,124,63,0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>{playbackId}</code>
            </p>
          </div>
          <button type="button" onClick={handleReset}
            style={{ fontSize: '0.75rem', color: '#8B2500', background: 'none', border: '1px solid rgba(180,60,40,0.3)', borderRadius: '999px', padding: '0.3rem 0.8rem', cursor: 'pointer' }}>
            Quitar
          </button>
        </div>
      )}
    </div>
  )
}
