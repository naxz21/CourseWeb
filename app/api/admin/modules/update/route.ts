import { NextRequest, NextResponse } from 'next/server'
import { requireAdminFromRequest } from '@/lib/auth/is-admin'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { user, isAdmin } = await requireAdminFromRequest(req)
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (!isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  try {
    const body = await req.json()
    const { moduleId, courseId, title, description } = body

    if (!moduleId || !courseId || !title) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const result = await supabaseAdmin.from('modules').update({ course_id: courseId, title, description }).eq('id', moduleId)

    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar módulo' }, { status: 500 })
  }
}
