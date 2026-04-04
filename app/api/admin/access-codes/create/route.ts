import { NextRequest, NextResponse } from 'next/server'
import { requireAdminFromRequest } from '@/lib/auth/is-admin'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { user, isAdmin } = await requireAdminFromRequest(req)
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (!isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  try {
    const { courseId, code, maxUses } = await req.json()

    if (!courseId || !code) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('access_codes')
      .insert({ course_id: courseId, code: code.toUpperCase(), max_uses: maxUses ?? 1 })

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Ese código ya existe' }, { status: 400 })
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear código' }, { status: 500 })
  }
}
