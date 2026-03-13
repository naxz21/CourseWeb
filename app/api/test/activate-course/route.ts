import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, courseId } = body

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'Faltan userId o courseId' },
        { status: 400 }
      )
    }

    const result = await supabaseAdmin.from('enrollments').upsert(
      {
        user_id: userId,
        course_id: courseId,
        status: 'active',
      },
      {
        onConflict: 'user_id,course_id',
      }
    )

    return NextResponse.json({ ok: true, result })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error activando curso' }, { status: 500 })
  }
}