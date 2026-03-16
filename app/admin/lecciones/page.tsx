import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/is-admin'
import { createClient } from '@/lib/supabase/server'
import CreateLessonForm from '@/components/admin/CreateLessonForm'
import DeleteLessonButton from '@/components/admin/DeleteLessonButton'
import MoveLessonButtons from '@/components/admin/MoveLessonButtons'

export default async function AdminLeccionesPage() {
  const { user, isAdmin } = await requireAdmin()

  if (!user) redirect('/login')
  if (!isAdmin) redirect('/dashboard')

  const supabase = await createClient()

  const [{ data: modules }, { data: lessons }] = await Promise.all([
    supabase
      .from('modules')
      .select(`
        id,
        title,
        course_id,
        courses (
          id,
          title
        )
      `)
      .order('title', { ascending: true }),

    supabase
      .from('lessons')
      .select(`
        id,
        title,
        lesson_type,
        video_url,
        pdf_url,
        image_url,
        content,
        position,
        module_id,
        modules (
          id,
          title
        )
      `)
      .order('module_id', { ascending: true })
      .order('position', { ascending: true }),
  ])

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Administrar lecciones</h1>
            <p className="mt-2 text-gray-400">
              Agregá, editá y organizá lecciones.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-white/30 px-4 py-2 text-white transition hover:bg-white hover:text-black"
          >
            ← Volver
          </Link>
        </div>

        <section className="mt-8 rounded-3xl border border-white/30 p-6">
          <h2 className="text-2xl font-bold">Crear lección</h2>
          <div className="mt-4">
            <CreateLessonForm
              modules={(modules as any) || []}
              existingLessons={(lessons as any) || []}
            />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-3xl font-bold">Lecciones existentes</h2>

          <div className="mt-6 grid gap-4">
            {lessons?.map((lesson: any) => {
              const module = Array.isArray(lesson.modules)
                ? lesson.modules[0]
                : lesson.modules

              return (
                <div
                  key={lesson.id}
                  className="rounded-3xl border border-white/30 p-6"
                >
                  <h3 className="text-2xl font-bold">{lesson.title}</h3>

                  <p className="mt-2 text-sm text-gray-400">
                    Módulo: {module?.title || 'Sin módulo'}
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    Tipo: {lesson.lesson_type}
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    Posición: {lesson.position}
                  </p>

                  {lesson.content && (
                    <p className="mt-4 text-gray-300">{lesson.content}</p>
                  )}

                  {lesson.video_url && (
                    <a
                      href={lesson.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 block text-blue-400 hover:underline"
                    >
                      Ver video
                    </a>
                  )}

                  {lesson.pdf_url && (
                    <a
                      href={lesson.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block text-blue-400 hover:underline"
                    >
                      Ver PDF
                    </a>
                  )}

                  {lesson.image_url && (
                    <a
                      href={lesson.image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block text-blue-400 hover:underline"
                    >
                      Ver imagen
                    </a>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3">
                    <MoveLessonButtons lessonId={lesson.id} />

                    <Link
                      href={`/admin/lecciones/${lesson.id}`}
                      className="rounded-xl border border-white/60 px-5 py-2 text-white transition hover:bg-white hover:text-black"
                    >
                      Editar
                    </Link>

                    <DeleteLessonButton lessonId={lesson.id} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}

