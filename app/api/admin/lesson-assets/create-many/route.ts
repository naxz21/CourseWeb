import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/is-admin'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { user, isAdmin } = await requireAdmin()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await req.json()
    const { lessonId, assets } = body

    console.log('CREATE MANY ROUTE HIT')
    console.log('lessonId:', lessonId)
    console.log('assets:', assets)

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
      file_url: asset.fileUrl,
      storage_bucket: asset.storageBucket || null,
      storage_path: asset.storagePath || null,
      position: asset.position || index + 1,
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