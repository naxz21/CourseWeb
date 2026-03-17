import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CreateLessonForm from '@/components/admin/CreateLessonForm'
import DeleteLessonButton from '@/components/admin/DeleteLessonButton'

export default async function AdminLessonsPage() {
  const supabase = await createClient()

  const { data: modules } = await supabase
    .from('modules')
    .select(`
      id,
      title,
      position,
      courses (
        title
      )
    `)
    .order('position', { ascending: true })

  const { data: lessons } = await supabase
    .from('lessons')
    .select(`
      id,
      title,
      lesson_type,
      content,
      position,
      module_id,
      cover_image_url,
      modules (
        id,
        title
      )
    `)
    .order('module_id', { ascending: true })
    .order('position', { ascending: true })

  return (
    <main className="space-y-8 p-8 text-white">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Administrar lecciones</h1>
          <p className="mt-1 text-gray-400">
            Creá, editá y organizá las lecciones del curso.
          </p>
        </div>

        <Link
          href="/admin"
          className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
        >
          ← Volver al panel admin
        </Link>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-xl font-semibold">Crear nueva lección</h2>
        <CreateLessonForm
          modules={modules || []}
          existingLessons={lessons || []}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Lecciones existentes</h2>

        {lessons && lessons.length > 0 ? (
          lessons.map((lesson: any) => (
            <div
              key={lesson.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold">{lesson.title}</h3>

                  <p className="mt-1 text-sm text-gray-300">
                    Tipo: {lesson.lesson_type}
                  </p>

                  <p className="text-sm text-gray-400">
                    Módulo:{' '}
                    {Array.isArray(lesson.modules)
                      ? (lesson.modules[0] as any)?.title || 'Sin módulo'
                      : (lesson.modules as any)?.title || 'Sin módulo'}
                  </p>

                  <p className="text-sm text-gray-400">
                    Posición: {lesson.position}
                  </p>

                  {lesson.content && (
                    <p className="mt-3 whitespace-pre-line text-sm text-gray-300">
                      {lesson.content}
                    </p>
                  )}

                  {lesson.cover_image_url && (
                    <img
                      src={lesson.cover_image_url}
                      alt={lesson.title}
                      className="mt-4 h-40 w-full rounded-2xl border border-white/10 object-cover"
                    />
                  )}
                </div>

                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/admin/lecciones/${lesson.id}/editar`}
                    className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:opacity-90"
                  >
                    Editar
                  </Link>

                  <DeleteLessonButton lessonId={lesson.id} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No hay lecciones cargadas.</p>
        )}
      </div>
    </main>
  )
}