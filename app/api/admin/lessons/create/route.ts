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
      videoUrl,
      pdfUrl,
      imageUrl,
    } = body

    if (!moduleId || !title || !lessonType) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    const allowedTypes = ['text', 'video', 'pdf', 'image']
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

    const result = await supabaseAdmin.from('lessons').insert({
      module_id: moduleId,
      title,
      lesson_type: lessonType,
      content: content || null,
      video_url: videoUrl || null,
      pdf_url: pdfUrl || null,
      image_url: imageUrl || null,
      position: nextPosition,
    })

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al crear lección' }, { status: 500 })
  }
}
