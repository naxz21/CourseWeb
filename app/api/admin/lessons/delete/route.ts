import { NextRequest, NextResponse } from 'next/server'
import { requireAdminFromRequest } from '@/lib/auth/is-admin'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { user, isAdmin } = await requireAdminFromRequest(req)

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  if (!isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { lessonId } = body

    if (!lessonId) {
      return NextResponse.json({ error: 'Falta lessonId' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('lessons')
      .delete()
      .eq('id', lessonId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('DELETE LESSON ERROR:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al eliminar lección' },
      { status: 500 }
    )
  }
}
