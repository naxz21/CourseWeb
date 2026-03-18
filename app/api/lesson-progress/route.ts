import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await req.json()

    const {
      courseId,
      moduleId,
      lessonId,
      action,
      completed,
    }: {
      courseId: string
      moduleId: string
      lessonId: string
      action: 'view' | 'complete'
      completed?: boolean
    } = body

    if (!courseId || !moduleId || !lessonId || !action) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    if (action === 'view') {
      const { error } = await supabase.from('lesson_progress').upsert(
        {
          user_id: user.id,
          course_id: courseId,
          module_id: moduleId,
          lesson_id: lessonId,
          last_viewed_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,lesson_id',
        }
      )

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ ok: true })
    }

    if (action === 'complete') {
      const { error } = await supabase.from('lesson_progress').upsert(
        {
          user_id: user.id,
          course_id: courseId,
          module_id: moduleId,
          lesson_id: lessonId,
          completed: !!completed,
          completed_at: completed ? new Date().toISOString() : null,
          last_viewed_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,lesson_id',
        }
      )

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}