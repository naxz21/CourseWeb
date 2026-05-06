// app/api/mux/status/[uploadId]/route.ts
// Consulta el estado del upload y devuelve el playback_id cuando está listo

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMuxUpload, getMuxAsset } from '@/lib/mux'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ uploadId: string }> }
) {
  const { uploadId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  try {
    const upload = await getMuxUpload(uploadId)

    if (!upload.asset_id) {
      return NextResponse.json({ status: 'waiting' })
    }

    const asset = await getMuxAsset(upload.asset_id)

    if (asset.status !== 'ready') {
      return NextResponse.json({ status: asset.status })
    }

    const playbackId = asset.playback_ids?.[0]?.id ?? null

    return NextResponse.json({
      status:      'ready',
      assetId:     asset.id,
      playbackId,
      duration:    asset.duration,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
