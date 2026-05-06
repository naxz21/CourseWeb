// app/api/mux/upload/route.ts
// Genera una URL de upload directo a Mux (el video nunca pasa por tu servidor)

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createMuxDirectUpload } from '@/lib/mux'

export async function POST() {
  try {
    // Solo admins pueden subir videos
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const { uploadId, uploadUrl } = await createMuxDirectUpload()

    return NextResponse.json({ uploadId, uploadUrl })
  } catch (err: any) {
    console.error('Mux upload error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
