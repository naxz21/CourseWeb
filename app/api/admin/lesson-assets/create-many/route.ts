import { NextRequest, NextResponse } from 'next/server'
import { requireAdminFromRequest } from '@/lib/auth/is-admin'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { user, isAdmin } = await requireAdminFromRequest(req)

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await req.json()
    const { lessonId, assets } = body

    if (!lessonId || !Array.isArray(assets)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    if (assets.length === 0) {
      return NextResponse.json({ ok: true })
    }

    const rows = assets.map((asset: any, index: number) => ({
      lesson_id: lessonId,
      asset_type: asset.assetType,
      title: asset.title || null,
      // file_url puede ser null para assets de gdrive
      file_url: asset.fileUrl || null,
      storage_bucket: asset.storageBucket || null,
      storage_path: asset.storagePath || null,
      position: asset.position || index + 1,
      // Nuevos campos
      provider: asset.provider || 'local',
      provider_file_id: asset.providerFileId || null,
    }))

    const { error } = await supabaseAdmin.from('lesson_assets').insert(rows)

    if (error) {
      console.error('CREATE MANY DB ERROR:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('CREATE MANY ASSETS ERROR:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al crear assets' },
      { status: 500 }
    )
  }
}