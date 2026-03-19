import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))

    const result = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: user.id,
          email: user.email,
          full_name: body.full_name ?? null,
          address: body.address ?? null,
          city: body.city ?? null,
          state: body.state ?? null,
          country: body.country ?? null,
          document_type: body.document_type ?? null,
          document_number: body.document_number ?? null,
          profession: body.profession ?? null,
        },
        { onConflict: 'id' }
      )
      .select()
      .single()

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, profile: result.data })
  } catch (error) {
    console.error('ensure profile error:', error)
    return NextResponse.json(
      { error: 'No se pudo asegurar el perfil' },
      { status: 500 }
    )
  }
}