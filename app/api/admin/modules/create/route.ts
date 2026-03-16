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
    const { courseId, title, description } = body

    if (!courseId || !title) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    const { data: lastModule, error: lastModuleError } = await supabaseAdmin
      .from('modules')
      .select('position')
      .eq('course_id', courseId)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lastModuleError) {
      return NextResponse.json(
        { error: lastModuleError.message },
        { status: 400 }
      )
    }

    const nextPosition = (lastModule?.position || 0) + 1

    const result = await supabaseAdmin.from('modules').insert({
      course_id: courseId,
      title,
      description,
      position: nextPosition,
    })

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al crear módulo' }, { status: 500 })
  }
}
