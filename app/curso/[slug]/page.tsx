import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BuyButton from '@/components/BuyButton'

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single()

  if (courseError || !course) {
    return <main className="p-8">Curso no encontrado</main>
  }

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .eq('status', 'active')
    .maybeSingle()

  const hasAccess = !!enrollment

  if (!hasAccess) {
    return (
      <main className="p-8">
        <div className="mb-6 flex gap-4">
          <a
            href="/dashboard"
            className="inline-block rounded-lg border px-4 py-2"
          >
            ← Dashboard
          </a>

          <a
            href="/curso"
            className="inline-block rounded-lg border px-4 py-2"
          >
            Ver cursos
          </a>
        </div>

        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="mt-4">{course.description}</p>

        {!hasAccess && (
          <p className="mt-2 text-lg font-semibold">
            Precio: ${course.price}
          </p>
        )}

        {hasAccess && (
          <div className="mt-4 rounded-xl bg-green-100 p-4 text-green-800">
            Ya tenés acceso a este curso.
          </div>
        )}

        <div className="mt-6 rounded-2xl border p-6">
          <h2 className="text-2xl font-semibold">Todavía no tenés acceso</h2>
          <p className="mt-2 text-gray-600">
            Comprá este curso para desbloquear todo el contenido.
          </p>

          <div className="mt-4">
            <BuyButton
              courseId={course.id}
              title={course.title}
              price={course.price}
              userEmail={user.email || ''}
              userId={user.id}
            />
          </div>
        </div>
      </main>
    )
  }

  const { data: modules } = await supabase
    .from('modules')
    .select(`
      id,
      title,
      description,
      position,
      lessons (
        id,
        title,
        lesson_type,
        video_url,
        pdf_url,
        image_url,
        content,
        position
      )
    `)
    .eq('course_id', course.id)
    .order('position', { ascending: true })

  return (
    <main className="p-8">
      <div className="mb-6 flex gap-4">
        <a
          href="/dashboard"
          className="inline-block rounded-lg border px-4 py-2"
        >
          ← Dashboard
        </a>

        <a
          href="/curso"
          className="inline-block rounded-lg border px-4 py-2"
        >
          Ver cursos
        </a>
      </div>

      <h1 className="text-3xl font-bold">{course.title}</h1>
      <p className="mt-4">{course.description}</p>

      <div className="mt-6 rounded-2xl border bg-green-50 p-4">
        <p className="font-medium text-green-700">
          Acceso activo. Ya podés ver el contenido del curso.
        </p>
      </div>

      <section className="mt-8 space-y-6">
        {modules && modules.length > 0 ? (
          modules.map((module: any) => (
            <div key={module.id} className="rounded-2xl border p-6">
              <h2 className="text-2xl font-semibold">{module.title}</h2>
              {module.description && (
                <p className="mt-2 text-gray-600">{module.description}</p>
              )}

              <div className="mt-4 space-y-4">
                {module.lessons && module.lessons.length > 0 ? (
                  [...module.lessons]
                    .sort((a: any, b: any) => a.position - b.position)
                    .map((lesson: any) => (
                      <div key={lesson.id} className="rounded-xl border p-4">
                        <h3 className="text-xl font-medium">{lesson.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Tipo: {lesson.lesson_type}
                        </p>

                        {lesson.lesson_type === 'text' && lesson.content && (
                          <p className="mt-3">{lesson.content}</p>
                        )}

                        {lesson.lesson_type === 'pdf' && lesson.pdf_url && (
                          <a
                            href={lesson.pdf_url}
                            target="_blank"
                            className="mt-3 inline-block rounded-lg border px-4 py-2"
                          >
                            Ver PDF
                          </a>
                        )}

                        {lesson.lesson_type === 'video' && lesson.video_url && (
                          <a
                            href={lesson.video_url}
                            target="_blank"
                            className="mt-3 inline-block rounded-lg border px-4 py-2"
                          >
                            Ver video
                          </a>
                        )}

                        {lesson.lesson_type === 'image' && lesson.image_url && (
                          <img
                            src={lesson.image_url}
                            alt={lesson.title}
                            className="mt-3 max-w-full rounded-xl border"
                          />
                        )}
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500">
                    Este módulo todavía no tiene lecciones.
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border p-6">
            <p className="text-gray-500">
              Este curso todavía no tiene módulos cargados.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}