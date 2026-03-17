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

    const {
      lessonId,
      moduleId,
      title,
      lessonType,
      content,
      coverImageUrl,
      coverStorageBucket,
      coverStoragePath,
    } = body

    if (!lessonId || !moduleId || !title || !lessonType) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('lessons')
      .update({
        module_id: moduleId,
        title,
        lesson_type: lessonType,
        content: content || null,
        cover_image_url: coverImageUrl || null,
        cover_storage_bucket: coverStorageBucket || null,
        cover_storage_path: coverStoragePath || null,
      })
      .eq('id', lessonId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('UPDATE LESSON ERROR:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al actualizar lección' },
      { status: 500 }
    )
  }
}