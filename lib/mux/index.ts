// lib/mux/index.ts

const MUX_TOKEN_ID     = process.env.MUX_TOKEN_ID!
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET!

const muxAuth = Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')
const MUX_BASE = 'https://api.mux.com'

// ─── Crear un upload directo (el navegador sube directo a Mux) ────────────────
export async function createMuxDirectUpload() {
  const res = await fetch(`${MUX_BASE}/video/v1/uploads`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${muxAuth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cors_origin: process.env.NEXT_PUBLIC_APP_URL || '*',
      new_asset_settings: {
        playback_policy: ['public'], // public = sin firma, gratis
        video_quality: 'basic',
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Mux upload error: ${err}`)
  }

  const { data } = await res.json()
  return {
    uploadId:  data.id as string,
    uploadUrl: data.url as string,
  }
}

// ─── Obtener info de un asset ─────────────────────────────────────────────────
export async function getMuxAsset(assetId: string) {
  const res = await fetch(`${MUX_BASE}/video/v1/assets/${assetId}`, {
    headers: { Authorization: `Basic ${muxAuth}` },
  })
  if (!res.ok) throw new Error('No se pudo obtener el asset de Mux')
  const { data } = await res.json()
  return data as {
    id: string
    status: string
    playback_ids: { id: string; policy: string }[]
    duration: number
  }
}

// ─── Obtener el asset_id desde un upload_id ───────────────────────────────────
export async function getMuxUpload(uploadId: string) {
  const res = await fetch(`${MUX_BASE}/video/v1/uploads/${uploadId}`, {
    headers: { Authorization: `Basic ${muxAuth}` },
  })
  if (!res.ok) throw new Error('No se pudo obtener el upload de Mux')
  const { data } = await res.json()
  return data as { id: string; asset_id: string | null; status: string }
}

// ─── Eliminar un asset ────────────────────────────────────────────────────────
export async function deleteMuxAsset(assetId: string) {
  await fetch(`${MUX_BASE}/video/v1/assets/${assetId}`, {
    method: 'DELETE',
    headers: { Authorization: `Basic ${muxAuth}` },
  })
}