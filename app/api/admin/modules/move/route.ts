import { NextRequest, NextResponse } from 'next/server'
import { requireAdminFromRequest } from '@/lib/auth/is-admin'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { user, isAdmin } = await requireAdminFromRequest(req)
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (!isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  try {
    const { moduleId, direction } = await req.json()

    if (!moduleId || !['up', 'down'].includes(direction)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const { data: current, error: currentError } = await supabaseAdmin.from('modules').select('id, course_id, position').eq('id', moduleId).single()
    if (currentError || !current) return NextResponse.json({ error: 'Módulo no encontrado' }, { status: 404 })

    const { data: siblings } = await supabaseAdmin.from('modules').select('id, position').eq('course_id', current.course_id).order('position', { ascending: true })
    if (!siblings) return NextResponse.json({ error: 'No se pudieron cargar los módulos' }, { status: 400 })

    const index = siblings.findIndex((item) => item.id === current.id)
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= siblings.length) return NextResponse.json({ ok: true })

    const target = siblings[targetIndex]
    await supabaseAdmin.from('modules').update({ position: -1 }).eq('id', current.id)
    await supabaseAdmin.from('modules').update({ position: current.position }).eq('id', target.id)
    await supabaseAdmin.from('modules').update({ position: target.position }).eq('id', current.id)

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al mover módulo' }, { status: 500 })
  }
}
