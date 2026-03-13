import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const result = await supabaseAdmin.from('profiles').upsert(
      {
        id: user.id,
        email: user.email,
      },
      {
        onConflict: 'id',
      }
    )

    return NextResponse.json({ ok: true, result })
  } catch (error) {
    console.error('ensure profile error:', error)
    return NextResponse.json(
      { error: 'No se pudo asegurar el perfil' },
      { status: 500 }
    )
  }
}