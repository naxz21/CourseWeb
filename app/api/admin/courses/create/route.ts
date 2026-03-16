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
    const { title, slug, description, price, published } = body

    if (!title || !slug || price === undefined || price === null) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    const result = await supabaseAdmin
      .from('courses')
      .insert([
        {
          title,
          slug,
          description,
          price,
          published,
        },
      ])
      .select()
      .single()

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: true, course: result.data })
  } catch (error) {
    console.error('create course error:', error)
    return NextResponse.json(
      { error: 'Error al crear curso' },
      { status: 500 }
    )
  }
}