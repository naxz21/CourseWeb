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
      moduleId,
      title,
      lessonType,
      content,
      coverImageUrl,
      coverStorageBucket,
      coverStoragePath,
    } = body

    if (!moduleId || !title || !lessonType) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    const allowedTypes = ['text', 'video', 'pdf', 'image', 'mixed']
    if (!allowedTypes.includes(lessonType)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    const { data: lastLesson, error: lastLessonError } = await supabaseAdmin
      .from('lessons')
      .select('position')
      .eq('module_id', moduleId)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lastLessonError) {
      return NextResponse.json(
        { error: lastLessonError.message },
        { status: 400 }
      )
    }

    const nextPosition = (lastLesson?.position || 0) + 1

    const { data, error } = await supabaseAdmin
      .from('lessons')
      .insert({
        module_id: moduleId,
        title,
        lesson_type: lessonType,
        content: content || null,
        cover_image_url: coverImageUrl || null,
        cover_storage_bucket: coverStorageBucket || null,
        cover_storage_path: coverStoragePath || null,
        position: nextPosition,
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, lessonId: data.id })
  } catch (error: any) {
    console.error('CREATE LESSON ERROR:', error)
    return NextResponse.json(
      { error: error?.message || 'Error al crear lección' },
      { status: 500 }
    )
  }
}