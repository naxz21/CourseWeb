import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))

    // Usamos el userId que viene del body (lo envía el registro justo después del signUp)
    const userId: string | undefined = body.userId
    const email: string | undefined = body.email

    if (!userId || !email) {
      return NextResponse.json({ error: 'Faltan userId o email' }, { status: 400 })
    }

    const result = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: userId,
          email: email,
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
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, profile: result.data })
  } catch (error) {
    console.error('ensure profile error:', error)
    return NextResponse.json({ error: 'No se pudo asegurar el perfil' }, { status: 500 })
  }
}