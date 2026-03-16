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
    const { moduleId, direction } = await req.json()

    if (!moduleId || !['up', 'down'].includes(direction)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const { data: current, error: currentError } = await supabaseAdmin
      .from('modules')
      .select('id, course_id, position')
      .eq('id', moduleId)
      .single()

    if (currentError || !current) {
      return NextResponse.json({ error: 'Módulo no encontrado' }, { status: 404 })
    }

    const { data: siblings, error: siblingsError } = await supabaseAdmin
      .from('modules')
      .select('id, position')
      .eq('course_id', current.course_id)
      .order('position', { ascending: true })

    if (siblingsError || !siblings) {
      return NextResponse.json({ error: 'No se pudieron cargar los módulos' }, { status: 400 })
    }

    const index = siblings.findIndex((item) => item.id === current.id)

    if (index === -1) {
      return NextResponse.json({ error: 'Módulo actual no encontrado en la lista' }, { status: 404 })
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= siblings.length) {
      return NextResponse.json({ ok: true })
    }

    const target = siblings[targetIndex]

    const currentPos = current.position
    const targetPos = target.position

    const step1 = await supabaseAdmin
      .from('modules')
      .update({ position: -1 })
      .eq('id', current.id)

    if (step1.error) {
      return NextResponse.json({ error: step1.error.message }, { status: 400 })
    }

    const step2 = await supabaseAdmin
      .from('modules')
      .update({ position: currentPos })
      .eq('id', target.id)

    if (step2.error) {
      return NextResponse.json({ error: step2.error.message }, { status: 400 })
    }

    const step3 = await supabaseAdmin
      .from('modules')
      .update({ position: targetPos })
      .eq('id', current.id)

    if (step3.error) {
      return NextResponse.json({ error: step3.error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al mover módulo' }, { status: 500 })
  }
}