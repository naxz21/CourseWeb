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

    let body: Record<string, unknown> = {}

    try {
      body = await req.json()
    } catch {
      body = {}
    }

    const payload: Record<string, unknown> = {
      id: user.id,
      email: user.email,
    }

    if (body.full_name !== undefined) payload.full_name = body.full_name
    if (body.address !== undefined) payload.address = body.address
    if (body.city !== undefined) payload.city = body.city
    if (body.state !== undefined) payload.state = body.state
    if (body.country !== undefined) payload.country = body.country
    if (body.document_type !== undefined) payload.document_type = body.document_type
    if (body.document_number !== undefined) payload.document_number = body.document_number
    if (body.profession !== undefined) payload.profession = body.profession

    const result = await supabaseAdmin
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })

    return NextResponse.json({ ok: true, result })
  } catch (error) {
    console.error('ensure profile error:', error)
    return NextResponse.json(
      { error: 'No se pudo asegurar el perfil' },
      { status: 500 }
    )
  }
}