import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await req.json()
    const { code, courseId } = body

    if (!code?.trim() || !courseId) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    // Buscar el código
    const { data: accessCode, error: codeError } = await supabaseAdmin
      .from('access_codes')
      .select('id, code, course_id, max_uses, uses, active')
      .eq('code', code.trim().toUpperCase())
      .eq('course_id', courseId)
      .maybeSingle()

    if (codeError || !accessCode) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 400 })
    }

    if (!accessCode.active) {
      return NextResponse.json({ error: 'Este código ya no está activo' }, { status: 400 })
    }

    if (accessCode.max_uses > 0 && accessCode.uses >= accessCode.max_uses) {
      return NextResponse.json({ error: 'Este código ya alcanzó el límite de usos' }, { status: 400 })
    }

    // Verificar si ya tiene acceso
    const { data: existing } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Ya tenés acceso a este curso' }, { status: 400 })
    }

    // Crear enrollment
    const { error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .insert({ user_id: user.id, course_id: courseId, status: 'active' })

    if (enrollError) {
      return NextResponse.json({ error: enrollError.message }, { status: 500 })
    }

    // Incrementar usos
    await supabaseAdmin
      .from('access_codes')
      .update({ uses: accessCode.uses + 1 })
      .eq('id', accessCode.id)

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al canjear código' }, { status: 500 })
  }
}
