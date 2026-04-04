import { NextRequest, NextResponse } from 'next/server'
import { requireAdminFromRequest } from '@/lib/auth/is-admin'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { user, isAdmin } = await requireAdminFromRequest(req)

  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (!isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  try {
    const body = await req.json()
    const { courseId, title, slug, description, price, published, cover_image_url } = body

    if (!courseId || !title || !slug || price === undefined || price === null) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('courses')
      .update({ title, slug, description, price, published, cover_image_url: cover_image_url ?? null })
      .eq('id', courseId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('update course error:', error)
    return NextResponse.json({ error: 'Error al actualizar curso' }, { status: 500 })
  }
}
