import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/is-admin'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const { user, isAdmin } = await requireAdmin()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  if (!isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { assetId } = body

    if (!assetId) {
      return NextResponse.json({ error: 'Falta assetId' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('lesson_assets')
      .delete()
      .eq('id', assetId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('DELETE ASSET ERROR:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al eliminar asset' },
      { status: 500 }
    )
  }
}